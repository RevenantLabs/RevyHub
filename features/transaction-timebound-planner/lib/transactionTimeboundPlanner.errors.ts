import { classifyHorizonError } from "@/core/horizon/errors";
import type { TransactionTimeboundPlannerErrorCode } from "@/features/transaction-timebound-planner/types";

/** Maps transport failures onto this tool's own error codes. */
export function toTransactionTimeboundPlannerErrorCode(error: unknown): TransactionTimeboundPlannerErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "not_found" ? "not_found" : "request_failed";
}
