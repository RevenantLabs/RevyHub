import {
  extractBaseAddress,
  decodeAddressToMuxedAccount,
  FeeBumpTransaction,
  xdr
} from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  AccountIdentity,
  FeeBidSummary,
  FeeBumpErrorCode,
  FeeBumpInput,
  FeeBumpReport,
  InnerLayerSummary,
  OuterLayerSummary,
  SignatureSummary
} from "@/features/fee-bump-inspector/types";

/**
 * Keeps the exact address the envelope carries and reports the underlying
 * `G…` account beside it.
 *
 * Collapsing an `M…` address to its base account would hide the muxed ID,
 * which is the one part of a muxed source a reader cannot reconstruct.
 */
export function describeAccount(address: string): AccountIdentity {
  if (!address.startsWith("M")) {
    return { address, baseAddress: null, muxedId: null };
  }

  try {
    const muxed = decodeAddressToMuxedAccount(address, true);
    return {
      address,
      baseAddress: extractBaseAddress(address),
      muxedId: muxed.med25519().id().toString()
    };
  } catch {
    // An address the SDK handed us that it cannot decode again is not worth
    // failing the whole report over — show it verbatim with nothing derived.
    return { address, baseAddress: null, muxedId: null };
  }
}

export function summarizeSignatures(signatures: xdr.DecoratedSignature[]): SignatureSummary {
  return {
    count: signatures.length,
    hints: signatures.map((signature) => signature.hint().toString("hex"))
  };
}

/**
 * A fee bump is charged for every inner operation plus one for the wrapper
 * itself, so the per-operation ceiling divides by `operations + 1`.
 *
 * The division is `BigInt`: a maximum fee is a 64-bit stroop count and can
 * exceed `Number.MAX_SAFE_INTEGER`.
 */
export function summarizeFeeBid(
  maxFee: string,
  innerFee: string,
  operationCount: number
): FeeBidSummary {
  const chargeableOperations = operationCount + 1;

  return {
    maxFee,
    innerFee,
    chargeableOperations,
    maxFeePerOperation: (BigInt(maxFee) / BigInt(chargeableOperations)).toString()
  };
}

function summarizeOuter(transaction: FeeBumpTransaction): OuterLayerSummary {
  return {
    feeSource: describeAccount(transaction.feeSource),
    maxFee: transaction.fee,
    hash: transaction.hash().toString("hex"),
    signatures: summarizeSignatures(transaction.signatures)
  };
}

function summarizeInner(transaction: FeeBumpTransaction["innerTransaction"]): InnerLayerSummary {
  const operationTypes = transaction.operations.map((operation) => operation.type);

  return {
    source: describeAccount(transaction.source),
    sequence: transaction.sequence,
    fee: transaction.fee,
    operationCount: operationTypes.length,
    operationTypes,
    hash: transaction.hash().toString("hex"),
    signatures: summarizeSignatures(transaction.signatures)
  };
}

/**
 * Decodes a fee-bump envelope entirely in-process.
 *
 * The envelope variant is read from the raw XDR *before* the SDK wrapper is
 * constructed. That ordering is what lets an ordinary transaction produce
 * `not_fee_bump` — a complete, correct envelope used with the wrong tool —
 * rather than being reported as malformed XDR.
 */
export function inspectFeeBump({
  envelope,
  networkPassphrase
}: FeeBumpInput): Result<FeeBumpReport, FeeBumpErrorCode> {
  let decoded: xdr.TransactionEnvelope;

  try {
    decoded = xdr.TransactionEnvelope.fromXDR(envelope, "base64");
  } catch {
    return err("invalid_xdr");
  }

  const variant = decoded.switch().name;
  if (variant === "envelopeTypeTx" || variant === "envelopeTypeTxV0") return err("not_fee_bump");
  if (variant !== "envelopeTypeTxFeeBump") return err("invalid_xdr");

  try {
    const transaction = new FeeBumpTransaction(decoded, networkPassphrase);
    const inner = summarizeInner(transaction.innerTransaction);

    return ok({
      networkPassphrase,
      outer: summarizeOuter(transaction),
      inner,
      feeBid: summarizeFeeBid(transaction.fee, inner.fee, inner.operationCount)
    });
  } catch {
    // The discriminant said fee bump but a field could not be normalised —
    // for example a fee bump wrapping something other than a v1 transaction.
    return err("invalid_xdr");
  }
}
