import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { TransactionTimeboundPlannerErrorCode, TransactionTimeboundPlannerInput, TransactionTimeboundPlannerResult } from "@/features/transaction-timebound-planner/types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runTransactionTimeboundPlanner(
  input: TransactionTimeboundPlannerInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<TransactionTimeboundPlannerResult, TransactionTimeboundPlannerErrorCode>> {
  return ok({ summary: input.value });
}
