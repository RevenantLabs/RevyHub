import type { TransactionBalanceChangeReconcilerErrorCode } from "@/features/transaction-balance-change-reconciler/types";

/**
 * This slice is fully offline, so there is no transport failure to classify.
 * Unexpected throws during decode map to `malformed_data` — the bytes reached
 * the decoder but did not yield usable envelope/result/meta structures.
 */
export function toTransactionBalanceChangeReconcilerErrorCode(
  error: unknown
): TransactionBalanceChangeReconcilerErrorCode {
  void error;
  return "malformed_data";
}

const INPUT_CODES: readonly TransactionBalanceChangeReconcilerErrorCode[] = [
  "empty_input",
  "invalid_input",
  "too_large"
];

export function isInputProblem(code: TransactionBalanceChangeReconcilerErrorCode): boolean {
  return INPUT_CODES.includes(code);
}
