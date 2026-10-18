import type { SizeErrorCode } from "@/features/transaction-size-analyzer/types";

/**
 * This slice makes no request, so there is no transport failure to classify.
 * Anything unexpected escaping the encoder is an undecodable envelope.
 */
export function toSizeErrorCode(error: unknown): SizeErrorCode {
  void error;
  return "invalid_xdr";
}

/** Codes caused by what was typed, rather than by the envelope's contents. */
const INPUT_CODES: readonly SizeErrorCode[] = [
  "empty_input",
  "invalid_input",
  "input_too_large",
  "invalid_budget"
];

export function isInputProblem(code: SizeErrorCode): boolean {
  return INPUT_CODES.includes(code);
}

/** True when the problem is the budget field rather than the envelope field. */
export function isBudgetProblem(code: SizeErrorCode): boolean {
  return code === "invalid_budget";
}
