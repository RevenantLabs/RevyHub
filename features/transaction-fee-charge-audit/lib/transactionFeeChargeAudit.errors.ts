import { classifyHorizonError } from "@/core/horizon/errors";
import type { TransactionFeeChargeAuditErrorCode } from "@/features/transaction-fee-charge-audit/types";

/**
 * Maps Horizon transport failures onto this tool's codes.
 * A bare 404 is ambiguous at the call site — callers rewrite it to
 * `transaction_not_found` or `ledger_not_found` depending on which request failed.
 */
export function toTransactionFeeChargeAuditErrorCode(
  error: unknown
): TransactionFeeChargeAuditErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "transaction_not_found";
  return "request_failed";
}
