import type {
  FeeBumpSideSnapshot,
  OuterFeeComparisonResult
} from "@/features/fee-bump-replacement-comparator/types";

/**
 * Describes how the outer fee terms and fee-source accounts differ.
 *
 * Arithmetic is `BigInt`: outer fees are 64-bit stroop counts and can exceed
 * `Number.MAX_SAFE_INTEGER`. A float subtract would silently lose stroops.
 */
export function compareOuterFees(
  left: FeeBumpSideSnapshot,
  right: FeeBumpSideSnapshot
): OuterFeeComparisonResult {
  const leftFee = BigInt(left.outerFee);
  const rightFee = BigInt(right.outerFee);
  const delta = rightFee - leftFee;

  return {
    leftOuterFee: left.outerFee,
    rightOuterFee: right.outerFee,
    leftFeeSource: left.feeSource,
    rightFeeSource: right.feeSource,
    leftOuterSignatureCount: left.outerSignatureCount,
    rightOuterSignatureCount: right.outerSignatureCount,
    leftInnerOperationCount: left.innerOperationCount,
    rightInnerOperationCount: right.innerOperationCount,
    feeDelta: delta.toString(),
    feeIncreased: delta > 0n,
    feeDecreased: delta < 0n,
    feeUnchanged: delta === 0n,
    sameFeeSource: left.feeSource === right.feeSource
  };
}

/** Signed stroop delta with an explicit leading `+` for increases. */
export function formatFeeDelta(delta: string): string {
  const value = BigInt(delta);
  if (value > 0n) return `+${value.toString()}`;
  return value.toString();
}
