import type { XdrErrorCode } from "@/features/xdr-inspector/types";

/**
 * This slice makes no request, so there is no transport failure to classify.
 * Anything unexpected escaping the decoder is a malformed envelope.
 */
export function toXdrErrorCode(error: unknown): XdrErrorCode {
  void error;
  return "malformed_envelope";
}

/** Codes caused by the pasted text rather than by the envelope's contents. */
const INPUT_CODES: readonly XdrErrorCode[] = [
  "empty_input",
  "input_too_large",
  "invalid_base64"
];

export function isInputProblem(code: XdrErrorCode): boolean {
  return INPUT_CODES.includes(code);
}
