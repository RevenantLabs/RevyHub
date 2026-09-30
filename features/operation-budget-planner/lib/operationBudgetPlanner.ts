import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { OperationBudgetPlannerErrorCode, OperationBudgetPlannerInput, OperationBudgetPlannerResult } from "@/features/operation-budget-planner/types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runOperationBudgetPlanner(
  input: OperationBudgetPlannerInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<OperationBudgetPlannerResult, OperationBudgetPlannerErrorCode>> {
  return ok({ summary: input.value });
}
