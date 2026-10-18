import type { DiffErrorCode } from "@/features/transaction-envelope-diff/types";

/**
 * This slice makes no request, so there is no transport failure to classify.
 * A failure that cannot be attributed to one side is reported against the
 * before envelope, which is the one a reviewer pastes first.
 */
export function toDiffErrorCode(error: unknown): DiffErrorCode {
  void error;
  return "invalid_left_xdr";
}

/** Codes that belong to one specific envelope field. */
export function isSideProblem(code: DiffErrorCode): boolean {
  return code === "invalid_left_xdr" || code === "invalid_right_xdr";
}

/** Codes caused by what was typed rather than by an envelope's contents. */
const INPUT_CODES: readonly DiffErrorCode[] = ["empty_input", "invalid_input", "input_too_large"];

export function isInputProblem(code: DiffErrorCode): boolean {
  return INPUT_CODES.includes(code);
}
