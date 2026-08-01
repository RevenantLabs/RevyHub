import { encodeMuxedAccountToAddress, StrKey, xdr } from "@stellar/stellar-sdk";

// Upper bound for pasted envelope text. Real classic envelopes are far smaller;
// even large Soroban envelopes fit comfortably under 64 KiB of base64.
export const MAX_XDR_INPUT_LENGTH = 65536;

export type EnvelopeVariant = "classic-v0" | "classic-v1" | "fee-bump";

export type XdrInspectionErrorCode =
  | "empty"
  | "too-large"
  | "invalid-base64"
  | "malformed"
  | "unsupported";

export interface MemoSummary {
  type: "none" | "text" | "id" | "hash" | "return";
  value: string | null;
}

export interface TimeBoundsSummary {
  minTime: string;
  maxTime: string;
}

export interface LedgerBoundsSummary {
  minLedger: number;
  maxLedger: number;
}

export interface PreconditionsSummary {
  timeBounds: TimeBoundsSummary | null;
  ledgerBounds: LedgerBoundsSummary | null;
  minSequenceNumber: string | null;
  minSequenceAge: string | null;
  minSequenceLedgerGap: number | null;
  extraSignerCount: number;
}

export interface FeeBumpSummary {
  feeSource: string;
  totalFee: string;
  outerSignatureCount: number;
}

export interface TransactionEnvelopeSummary {
  variant: EnvelopeVariant;
  sourceAccount: string;
  sequence: string;
  fee: string;
  memo: MemoSummary;
  preconditions: PreconditionsSummary;
  operationTypes: string[];
  signatureCount: number;
  feeBump: FeeBumpSummary | null;
}

export type XdrInspectionResult =
  | { ok: true; summary: TransactionEnvelopeSummary }
  | { ok: false; code: XdrInspectionErrorCode; message: string };

export const NETWORK_PASSPHRASE_NOTE =
  "A transaction envelope does not contain the network passphrase. The same XDR produces a different hash and signature base on testnet and mainnet, so signatures cannot be verified locally without knowing which network the envelope was built for.";

const emptyPreconditions = (): PreconditionsSummary => ({
  timeBounds: null,
  ledgerBounds: null,
  minSequenceNumber: null,
  minSequenceAge: null,
  minSequenceLedgerGap: null,
  extraSignerCount: 0
});

function summarizeMemo(memo: xdr.Memo): MemoSummary {
  switch (memo.switch().name) {
    case "memoNone":
      return { type: "none", value: null };
    case "memoText":
      return { type: "text", value: memo.text().toString() };
    case "memoId":
      return { type: "id", value: memo.id().toString() };
    case "memoHash":
      return { type: "hash", value: memo.hash().toString("hex") };
    case "memoReturn":
      return { type: "return", value: memo.retHash().toString("hex") };
    default:
      return { type: "none", value: null };
  }
}

function summarizeTimeBounds(timeBounds: xdr.TimeBounds | null): TimeBoundsSummary | null {
  if (!timeBounds) {
    return null;
  }

  return {
    minTime: timeBounds.minTime().toString(),
    maxTime: timeBounds.maxTime().toString()
  };
}

function summarizePreconditions(cond: xdr.Preconditions): PreconditionsSummary {
  switch (cond.switch().name) {
    case "precondTime":
      return { ...emptyPreconditions(), timeBounds: summarizeTimeBounds(cond.timeBounds()) };
    case "precondV2": {
      const v2 = cond.v2();
      const ledgerBounds = v2.ledgerBounds();
      const minSeqNum = v2.minSeqNum();

      return {
        timeBounds: summarizeTimeBounds(v2.timeBounds()),
        ledgerBounds: ledgerBounds
          ? { minLedger: ledgerBounds.minLedger(), maxLedger: ledgerBounds.maxLedger() }
          : null,
        minSequenceNumber: minSeqNum ? minSeqNum.toString() : null,
        minSequenceAge: v2.minSeqAge().toString(),
        minSequenceLedgerGap: v2.minSeqLedgerGap(),
        extraSignerCount: v2.extraSigners().length
      };
    }
    default:
      return emptyPreconditions();
  }
}

function operationTypeNames(operations: xdr.Operation[]): string[] {
  return operations.map((operation) => operation.body().switch().name);
}

function summarizeV0(envelope: xdr.TransactionV0Envelope): TransactionEnvelopeSummary {
  const tx = envelope.tx();

  return {
    variant: "classic-v0",
    sourceAccount: StrKey.encodeEd25519PublicKey(tx.sourceAccountEd25519()),
    sequence: tx.seqNum().toString(),
    fee: tx.fee().toString(),
    memo: summarizeMemo(tx.memo()),
    preconditions: { ...emptyPreconditions(), timeBounds: summarizeTimeBounds(tx.timeBounds()) },
    operationTypes: operationTypeNames(tx.operations()),
    signatureCount: envelope.signatures().length,
    feeBump: null
  };
}

function summarizeV1(envelope: xdr.TransactionV1Envelope): TransactionEnvelopeSummary {
  const tx = envelope.tx();

  return {
    variant: "classic-v1",
    sourceAccount: encodeMuxedAccountToAddress(tx.sourceAccount(), true),
    sequence: tx.seqNum().toString(),
    fee: tx.fee().toString(),
    memo: summarizeMemo(tx.memo()),
    preconditions: summarizePreconditions(tx.cond()),
    operationTypes: operationTypeNames(tx.operations()),
    signatureCount: envelope.signatures().length,
    feeBump: null
  };
}

function summarizeFeeBump(envelope: xdr.FeeBumpTransactionEnvelope): XdrInspectionResult {
  const tx = envelope.tx();
  const innerTx = tx.innerTx();

  if (innerTx.switch().name !== "envelopeTypeTx") {
    return {
      ok: false,
      code: "unsupported",
      message: `Fee-bump envelopes wrapping "${innerTx.switch().name}" inner transactions are not supported yet.`
    };
  }

  const inner = summarizeV1(innerTx.v1());

  return {
    ok: true,
    summary: {
      ...inner,
      variant: "fee-bump",
      feeBump: {
        feeSource: encodeMuxedAccountToAddress(tx.feeSource(), true),
        totalFee: tx.fee().toString(),
        outerSignatureCount: envelope.signatures().length
      }
    }
  };
}

/**
 * Decodes a transaction-envelope XDR string entirely in-process. No network
 * request is made, and the input is never logged or persisted.
 */
export function inspectTransactionXdr(input: string): XdrInspectionResult {
  const sanitized = input.replace(/\s+/g, "");

  if (!sanitized) {
    return {
      ok: false,
      code: "empty",
      message: "Paste a base64-encoded transaction envelope XDR string to inspect."
    };
  }

  if (sanitized.length > MAX_XDR_INPUT_LENGTH) {
    return {
      ok: false,
      code: "too-large",
      message: `The input is longer than the ${MAX_XDR_INPUT_LENGTH.toLocaleString()} character limit for envelope XDR.`
    };
  }

  if (sanitized.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(sanitized)) {
    return {
      ok: false,
      code: "invalid-base64",
      message: "The input is not valid base64. Envelope XDR uses the characters A-Z, a-z, 0-9, +, / and = padding."
    };
  }

  let envelope: xdr.TransactionEnvelope;

  try {
    envelope = xdr.TransactionEnvelope.fromXDR(sanitized, "base64");
  } catch {
    return {
      ok: false,
      code: "malformed",
      message: "The bytes decoded from base64 are not a well-formed transaction envelope. Make sure you copied transaction-envelope XDR, not another XDR type such as a ledger entry or result."
    };
  }

  try {
    switch (envelope.switch().name) {
      case "envelopeTypeTxV0":
        return { ok: true, summary: summarizeV0(envelope.v0()) };
      case "envelopeTypeTx":
        return { ok: true, summary: summarizeV1(envelope.v1()) };
      case "envelopeTypeTxFeeBump":
        return summarizeFeeBump(envelope.feeBump());
      default:
        return {
          ok: false,
          code: "unsupported",
          message: `Envelope type "${envelope.switch().name}" is not supported by this inspector.`
        };
    }
  } catch {
    return {
      ok: false,
      code: "malformed",
      message: "The envelope decoded, but one of its fields could not be normalized for display."
    };
  }
}
