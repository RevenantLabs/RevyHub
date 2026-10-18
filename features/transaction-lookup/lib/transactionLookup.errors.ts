import { classifyHorizonError } from "@/core/horizon/errors";
import type { TransactionErrorCode } from "@/features/transaction-lookup/types";

export function toTransactionErrorCode(error: unknown): TransactionErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
