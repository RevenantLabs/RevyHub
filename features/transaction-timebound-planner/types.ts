export interface TransactionTimeboundPlannerInput {
  value: string;
}

export interface TransactionTimeboundPlannerResult {
  summary: string;
}

export type TransactionTimeboundPlannerErrorCode = "empty_input" | "invalid_input" | "not_found" | "request_failed";
