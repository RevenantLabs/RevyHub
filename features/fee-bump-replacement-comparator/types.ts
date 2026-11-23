/** Expected failures for this offline comparator. */
export type FeeBumpReplacementComparatorErrorCode =
  | "empty_input"
  | "invalid_input"
  | "too_large"
  | "malformed_data"
  | "unsupported_variant";

/**
 * Which envelope a decode/shape problem came from.
 *
 * Carried as a detail so the UI can point at the right field without
 * expanding the fixed error-code vocabulary.
 */
export type EnvelopeSide = "left" | "right";

/**
 * Why an `invalid_input` was rejected when the reason changes what the UI
 * must do (clear a secret) rather than only what it says.
 */
export type InputRejectionReason = "secret_key";

export type DecodeRejectionDetail = EnvelopeSide | InputRejectionReason;

export interface FeeBumpReplacementComparatorInput {
  left: string;
  right: string;
  networkPassphrase: string;
}

/** One decoded fee-bump side, ready for comparison. */
export interface FeeBumpSideSnapshot {
  /** Outer maximum fee bid, in stroops (exact decimal string). */
  outerFee: string;
  feeSource: string;
  outerSignatureCount: number;
  /** Inner transaction hash under the selected network passphrase. */
  innerHash: string;
  /** Canonical inner transaction body XDR (no signatures). */
  innerPayloadXdr: string;
  innerSource: string;
  innerSequence: string;
  innerOperationCount: number;
  innerSignatureCount: number;
}

export type InnerIdentityReason =
  | "equivalent"
  | "hash_mismatch"
  | "payload_mismatch"
  | "hash_and_payload_mismatch";

export interface InnerIdentityComparison {
  leftInnerHash: string;
  rightInnerHash: string;
  leftInnerPayloadXdr: string;
  rightInnerPayloadXdr: string;
  hashesMatch: boolean;
  payloadsMatch: boolean;
  /**
   * True only when both the network-aware hashes and the signature-free
   * payloads match. Either mismatch refuses an equivalent-inner verdict.
   */
  equivalent: boolean;
  reason: InnerIdentityReason;
}

export interface OuterFeeComparisonResult {
  leftOuterFee: string;
  rightOuterFee: string;
  leftFeeSource: string;
  rightFeeSource: string;
  leftOuterSignatureCount: number;
  rightOuterSignatureCount: number;
  leftInnerOperationCount: number;
  rightInnerOperationCount: number;
  /** `right - left` in stroops, exact signed decimal string. */
  feeDelta: string;
  feeIncreased: boolean;
  feeDecreased: boolean;
  feeUnchanged: boolean;
  sameFeeSource: boolean;
}

export interface FeeBumpReplacementComparatorResult {
  networkPassphrase: string;
  left: FeeBumpSideSnapshot;
  right: FeeBumpSideSnapshot;
  innerIdentity: InnerIdentityComparison;
  outerFee: OuterFeeComparisonResult;
  /**
   * True only when the inners are equivalent under the selected network.
   * A false value is complete evidence that a replacement claim is refused —
   * not missing data.
   */
  replacementCandidate: boolean;
}
