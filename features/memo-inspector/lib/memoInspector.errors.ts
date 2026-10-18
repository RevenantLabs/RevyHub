import type { MemoErrorCode } from "@/features/memo-inspector/types";

/**
 * This slice makes no request, so there is no transport failure to classify.
 * Anything unexpected escaping the codec means bytes that could not be turned
 * back into a memo, which is what `decode_failed` says.
 */
export function toMemoErrorCode(error: unknown): MemoErrorCode {
  void error;
  return "decode_failed";
}

/** Codes caused by the value the user typed rather than by the memo type. */
const VALUE_CODES: readonly MemoErrorCode[] = [
  "empty_input",
  "text_too_long",
  "invalid_id",
  "invalid_hash"
];

export function isValueProblem(code: MemoErrorCode): boolean {
  return VALUE_CODES.includes(code);
}
