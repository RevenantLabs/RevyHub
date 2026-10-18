import type { SourceMapErrorCode } from "@/features/operation-source-map/types";

/**
 * This slice makes no request, so there is no transport failure to classify.
 * Anything unexpected escaping the decoder is an undecodable envelope.
 */
export function toSourceMapErrorCode(error: unknown): SourceMapErrorCode {
  void error;
  return "invalid_xdr";
}

/** Codes caused by the pasted text rather than by the envelope's contents. */
const INPUT_CODES: readonly SourceMapErrorCode[] = [
  "empty_input",
  "invalid_input",
  "input_too_large"
];

export function isInputProblem(code: SourceMapErrorCode): boolean {
  return INPUT_CODES.includes(code);
}

/**
 * True when the bytes were a real envelope this tool simply cannot map, which
 * deserves different advice from "your paste is broken".
 */
export function isUnsupportedEnvelope(code: SourceMapErrorCode): boolean {
  return code === "unsupported_envelope";
}
