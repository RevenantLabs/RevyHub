import type { FeeBumpReplacementComparatorErrorCode } from "@/features/fee-bump-replacement-comparator/types";

/**
 * This slice makes no request, so there is no transport failure to classify.
 * Anything unexpected escaping the decoder is treated as malformed envelope
 * data on the left side (the one a reviewer pastes first).
 */
export function toFeeBumpReplacementComparatorErrorCode(
  error: unknown
): FeeBumpReplacementComparatorErrorCode {
  void error;
  return "malformed_data";
}

/** Codes caused by what was typed rather than by an envelope's contents. */
const INPUT_CODES: readonly FeeBumpReplacementComparatorErrorCode[] = [
  "empty_input",
  "invalid_input",
  "too_large"
];

export function isInputProblem(code: FeeBumpReplacementComparatorErrorCode): boolean {
  return INPUT_CODES.includes(code);
}

/**
 * An ordinary transaction is a usable envelope in the wrong tool, not corrupt
 * bytes — the UI can announce it as information rather than an error.
 */
export function isUnsupportedVariant(code: FeeBumpReplacementComparatorErrorCode): boolean {
  return code === "unsupported_variant";
}
