import type { FeeBumpErrorCode } from "@/features/fee-bump-inspector/types";

/**
 * This slice makes no request, so there is no transport failure to classify.
 * Anything unexpected escaping the decoder is an undecodable envelope.
 */
export function toFeeBumpErrorCode(error: unknown): FeeBumpErrorCode {
  void error;
  return "invalid_xdr";
}

/** Codes caused by what was typed, rather than by the envelope's contents. */
const INPUT_CODES: readonly FeeBumpErrorCode[] = [
  "empty_input",
  "invalid_input",
  "input_too_large",
  "empty_passphrase"
];

export function isInputProblem(code: FeeBumpErrorCode): boolean {
  return INPUT_CODES.includes(code);
}

/**
 * `not_fee_bump` is the one failure that means the envelope is fine and the
 * tool is wrong for it, so the UI can offer a different suggestion.
 */
export function isWrongEnvelopeKind(code: FeeBumpErrorCode): boolean {
  return code === "not_fee_bump";
}
