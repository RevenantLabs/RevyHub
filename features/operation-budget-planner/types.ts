export interface OperationBudgetPlannerInput {
  value: string;
}

export interface OperationBudgetPlannerResult {
  summary: string;
}

export type OperationBudgetPlannerErrorCode = "empty_input" | "invalid_input" | "not_found" | "request_failed";
