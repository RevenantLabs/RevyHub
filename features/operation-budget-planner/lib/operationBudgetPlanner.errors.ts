import { classifyHorizonError } from "@/core/horizon/errors";
import type { OperationBudgetPlannerErrorCode } from "@/features/operation-budget-planner/types";

/** Maps transport failures onto this tool's own error codes. */
export function toOperationBudgetPlannerErrorCode(error: unknown): OperationBudgetPlannerErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "not_found" ? "not_found" : "request_failed";
}
