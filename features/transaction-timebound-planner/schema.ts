import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { TransactionTimeboundPlannerErrorCode, TransactionTimeboundPlannerInput } from "@/features/transaction-timebound-planner/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseTransactionTimeboundPlannerInput(raw: string): Result<TransactionTimeboundPlannerInput, TransactionTimeboundPlannerErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  return ok({ value });
}
