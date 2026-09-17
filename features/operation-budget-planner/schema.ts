import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { OperationBudgetPlannerErrorCode, OperationBudgetPlannerInput } from "@/features/operation-budget-planner/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseOperationBudgetPlannerInput(raw: string): Result<OperationBudgetPlannerInput, OperationBudgetPlannerErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  return ok({ value });
}
