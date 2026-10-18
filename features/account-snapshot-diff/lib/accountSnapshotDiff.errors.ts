import type { SnapshotErrorCode } from "@/features/account-snapshot-diff/types";

/**
 * This slice makes no request, so there is no transport failure to classify.
 * Anything unexpected escaping the parser is a document that is not a
 * supported account snapshot.
 */
export function toSnapshotErrorCode(error: unknown): SnapshotErrorCode {
  void error;
  return "invalid_snapshot";
}

/** Codes caused by what was pasted rather than by the snapshots' contents. */
const INPUT_CODES: readonly SnapshotErrorCode[] = [
  "empty_input",
  "invalid_input",
  "input_too_large"
];

export function isInputProblem(code: SnapshotErrorCode): boolean {
  return INPUT_CODES.includes(code);
}

/**
 * True when both documents parsed fine and simply describe different accounts
 * — a mistake with different advice from "this is not JSON".
 */
export function isMismatch(code: SnapshotErrorCode): boolean {
  return code === "account_mismatch";
}
