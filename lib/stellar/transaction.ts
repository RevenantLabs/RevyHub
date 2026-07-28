import { getHorizonServer, STELLAR_NETWORK, type StellarNetwork } from "@/lib/stellar/horizon";
import { getResponseStatus } from "@/lib/stellar/account";
import type { TransactionSummary } from "@/components/stellar/TransactionDetails";
import { TransactionBuilder, xdr, FeeBumpTransaction, Transaction } from "@stellar/stellar-sdk";

export function isLikelyTransactionHash(value: string) {
  return /^[a-fA-F0-9]{64}$/.test(value.trim());
}

// Maximum allowed XDR input size (8KB to prevent DoS)
const MAX_XDR_SIZE = 8192;

export type EnvelopeType = "ENVELOPE_TYPE_TX_V0" | "ENVELOPE_TYPE_TX" | "ENVELOPE_TYPE_TX_FEE_BUMP";

export interface OperationInfo {
  type: string;
  sourceAccount?: string;
}

export interface DecodedEnvelope {
  envelopeType: EnvelopeType;
  sourceAccount: string;
  sequence: string;
  fee: string;
  memo: string;
  memoType: string;
  operations: OperationInfo[];
  signatureCount: number;
  timeBounds?: {
    minTime: string;
    maxTime: string;
  };
  networkPassphrase?: string;
}

/**
 * Decode a transaction envelope XDR string locally without network submission.
 * Supports classic (V0, V1) and fee-bump envelopes.
 * @param xdrString - Base64-encoded transaction envelope XDR
 * @returns Decoded envelope information
 * @throws Error if XDR is malformed, oversized, or unsupported
 */
export function decodeTransactionEnvelope(xdrString: string): DecodedEnvelope {
  const trimmed = xdrString.trim();

  // Validate size bounds
  if (!trimmed) {
    throw new Error("XDR string cannot be empty.");
  }

  if (trimmed.length > MAX_XDR_SIZE) {
    throw new Error(`XDR exceeds maximum size of ${MAX_XDR_SIZE} characters.`);
  }

  try {
    // Parse the XDR envelope
    const envelope = xdr.TransactionEnvelope.fromXDR(trimmed, "base64");
    const envelopeType = envelope.switch().name as EnvelopeType;

    // Handle fee-bump envelopes
    if (envelopeType === "ENVELOPE_TYPE_TX_FEE_BUMP") {
      return decodeFeeBumpEnvelope(envelope);
    }

    // Handle classic transaction envelopes (V0 and V1)
    if (envelopeType === "ENVELOPE_TYPE_TX_V0" || envelopeType === "ENVELOPE_TYPE_TX") {
      return decodeClassicEnvelope(envelope, envelopeType);
    }

    throw new Error(`Unsupported envelope type: ${envelopeType}`);
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw our custom errors
      if (error.message.startsWith("XDR") || error.message.startsWith("Unsupported")) {
        throw error;
      }
      throw new Error(`Malformed XDR: ${error.message}`);
    }
    throw new Error("Failed to decode XDR. Ensure it is a valid base64-encoded transaction envelope.");
  }
}

function decodeClassicEnvelope(envelope: xdr.TransactionEnvelope, envelopeType: EnvelopeType): DecodedEnvelope {
  let tx: xdr.Transaction;
  let signatures: xdr.DecoratedSignature[];

  if (envelopeType === "ENVELOPE_TYPE_TX_V0") {
    const v0 = envelope.v0();
    tx = v0.tx();
    signatures = v0.signatures();
  } else {
    const v1 = envelope.v1();
    tx = v1.tx();
    signatures = v1.signatures();
  }

  // Extract source account
  const sourceAccount = encodeAccountId(tx.sourceAccount());

  // Extract sequence
  const sequence = tx.seqNum().toString();

  // Extract fee
  const fee = tx.fee().toString();

  // Extract memo
  const memoInfo = extractMemo(tx.memo());

  // Extract operations
  const operations = tx.operations().map((op) => extractOperation(op));

  // Extract time bounds
  const timeBounds = extractTimeBounds(tx.cond());

  return {
    envelopeType,
    sourceAccount,
    sequence,
    fee,
    memo: memoInfo.memo,
    memoType: memoInfo.memoType,
    operations,
    signatureCount: signatures.length,
    timeBounds,
  };
}

function decodeFeeBumpEnvelope(envelope: xdr.TransactionEnvelope): DecodedEnvelope {
  const feeBump = envelope.feeBump();
  const tx = feeBump.tx();
  const innerTxEnvelope = tx.innerTx();
  const signatures = feeBump.signatures();

  // Extract fee payer (source account for fee bump)
  const feeSource = encodeAccountId(tx.feeSource());

  // Extract inner transaction
  const innerEnvelope = decodeClassicEnvelope(innerTxEnvelope, innerTxEnvelope.switch().name as EnvelopeType);

  // Fee bump wraps the inner transaction
  return {
    envelopeType: "ENVELOPE_TYPE_TX_FEE_BUMP",
    sourceAccount: feeSource,
    sequence: innerEnvelope.sequence,
    fee: tx.fee().toString(),
    memo: innerEnvelope.memo,
    memoType: innerEnvelope.memoType,
    operations: innerEnvelope.operations,
    signatureCount: signatures.length,
    timeBounds: innerEnvelope.timeBounds,
    networkPassphrase: "Fee-bump transaction wraps an inner transaction",
  };
}

function encodeAccountId(accountId: xdr.MuxedAccount): string {
  const accountType = accountId.switch().name;
  
  if (accountType === "keyTypeEd25519") {
    const publicKey = accountId.ed25519();
    return TransactionBuilder.constructKeypairFromPublicKey(publicKey).publicKey();
  }
  
  if (accountType === "keyTypeMuxedEd25519") {
    const muxed = accountId.med25519();
    const publicKey = muxed.ed25519();
    return TransactionBuilder.constructKeypairFromPublicKey(publicKey).publicKey();
  }

  return "Unknown account type";
}

function extractMemo(memo: xdr.Memo): { memo: string; memoType: string } {
  const memoType = memo.switch().name;

  switch (memoType) {
    case "memoNone":
      return { memo: "(none)", memoType: "MEMO_NONE" };
    case "memoText":
      return { memo: memo.text().toString("utf-8"), memoType: "MEMO_TEXT" };
    case "memoId":
      return { memo: memo.id().toString(), memoType: "MEMO_ID" };
    case "memoHash":
      return { memo: memo.hash().toString("hex"), memoType: "MEMO_HASH" };
    case "memoReturn":
      return { memo: memo.retHash().toString("hex"), memoType: "MEMO_RETURN" };
    default:
      return { memo: "Unknown memo type", memoType: memoType };
  }
}

function extractOperation(op: xdr.Operation): OperationInfo {
  const opType = op.body().switch().name;
  const sourceAccount = op.sourceAccount() ? encodeAccountId(op.sourceAccount()!) : undefined;

  return {
    type: opType,
    sourceAccount,
  };
}

function extractTimeBounds(preconditions: xdr.Preconditions): { minTime: string; maxTime: string } | undefined {
  const precondType = preconditions.switch().name;

  if (precondType === "precondNone") {
    return undefined;
  }

  if (precondType === "precondTime") {
    const timeBounds = preconditions.timeBounds();
    return {
      minTime: timeBounds.minTime().toString(),
      maxTime: timeBounds.maxTime().toString(),
    };
  }

  if (precondType === "precondV2") {
    const v2 = preconditions.v2();
    const timeBounds = v2.timeBounds();
    
    if (timeBounds) {
      return {
        minTime: timeBounds.minTime().toString(),
        maxTime: timeBounds.maxTime().toString(),
      };
    }
  }

  return undefined;
}

export async function lookupTransaction(
  hash: string,
  network: StellarNetwork = STELLAR_NETWORK
): Promise<TransactionSummary> {
  // TODO(issue #10): Fetch and normalize transaction operations for display below the transaction summary.
  if (!hash.trim()) {
    throw new Error("Enter a transaction hash.");
  }

  if (!isLikelyTransactionHash(hash)) {
    throw new Error("Transaction hashes are 64 hexadecimal characters.");
  }

  try {
    const server = getHorizonServer(network);
    const transaction = await server.transactions().transaction(hash.trim()).call();

    return {
      hash: transaction.hash,
      ledger: transaction.ledger_attr,
      sourceAccount: transaction.source_account,
      feeCharged: String(transaction.fee_charged),
      createdAt: transaction.created_at,
      successful: transaction.successful,
      network,
      operationCount: transaction.operation_count
    };
  } catch (error) {
    if (getResponseStatus(error) === 404) {
      throw new Error(`Transaction not found on Stellar ${network}.`);
    }

    throw new Error("Could not load transaction from Horizon. Try again in a moment.");
  }
}
