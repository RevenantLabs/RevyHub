import { FeeBumpTransaction, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import {
  compareInnerIdentity,
  isEquivalentInner
} from "@/features/fee-bump-replacement-comparator/lib/inner-identity";
import { compareOuterFees } from "@/features/fee-bump-replacement-comparator/lib/outer-fee-diff";
import type {
  EnvelopeSide,
  FeeBumpReplacementComparatorErrorCode,
  FeeBumpReplacementComparatorInput,
  FeeBumpReplacementComparatorResult,
  FeeBumpSideSnapshot
} from "@/features/fee-bump-replacement-comparator/types";

/**
 * Reads the envelope discriminant before constructing the SDK wrapper so an
 * ordinary transaction becomes `unsupported_variant` rather than
 * `malformed_data`.
 */
function decodeFeeBumpSide(
  envelope: string,
  networkPassphrase: string,
  side: EnvelopeSide
): Result<FeeBumpSideSnapshot, FeeBumpReplacementComparatorErrorCode, EnvelopeSide> {
  let decoded: xdr.TransactionEnvelope;

  try {
    decoded = xdr.TransactionEnvelope.fromXDR(envelope, "base64");
  } catch {
    return err("malformed_data", side);
  }

  const variant = decoded.switch().name;
  if (variant === "envelopeTypeTx" || variant === "envelopeTypeTxV0") {
    return err("unsupported_variant", side);
  }
  if (variant !== "envelopeTypeTxFeeBump") {
    return err("malformed_data", side);
  }

  try {
    const transaction = new FeeBumpTransaction(decoded, networkPassphrase);
    const inner = transaction.innerTransaction;

    // Signature-free body XDR: identity of what executes, not who signed it.
    const innerPayloadXdr = inner.toEnvelope().v1().tx().toXDR("base64");

    return ok({
      outerFee: transaction.fee,
      feeSource: transaction.feeSource,
      outerSignatureCount: transaction.signatures.length,
      innerHash: inner.hash().toString("hex"),
      innerPayloadXdr,
      innerSource: inner.source,
      innerSequence: inner.sequence,
      innerOperationCount: inner.operations.length,
      innerSignatureCount: inner.signatures.length
    });
  } catch {
    return err("malformed_data", side);
  }
}

/**
 * Compares two fee-bump envelopes intended to wrap the same inner transaction.
 *
 * Reports outer fee terms and fee sources either way, but only marks a
 * replacement candidate when both the network-aware inner hashes and the
 * signature-free payloads match under the selected passphrase.
 */
export function compareFeeBumpReplacements({
  left,
  right,
  networkPassphrase
}: FeeBumpReplacementComparatorInput): Result<
  FeeBumpReplacementComparatorResult,
  FeeBumpReplacementComparatorErrorCode,
  EnvelopeSide
> {
  const leftSide = decodeFeeBumpSide(left, networkPassphrase, "left");
  if (!leftSide.ok) return leftSide;

  const rightSide = decodeFeeBumpSide(right, networkPassphrase, "right");
  if (!rightSide.ok) return rightSide;

  const innerIdentity = compareInnerIdentity(
    leftSide.value.innerHash,
    rightSide.value.innerHash,
    leftSide.value.innerPayloadXdr,
    rightSide.value.innerPayloadXdr
  );
  const outerFee = compareOuterFees(leftSide.value, rightSide.value);
  const replacementCandidate = isEquivalentInner(innerIdentity);

  return ok({
    networkPassphrase,
    left: leftSide.value,
    right: rightSide.value,
    innerIdentity,
    outerFee,
    replacementCandidate
  });
}
