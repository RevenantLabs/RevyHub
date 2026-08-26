export interface AccountMergePreflightInput {
  value: string;
}

export interface AccountMergePreflightResult {
  summary: string;
}

export type AccountMergePreflightErrorCode = "empty_input" | "invalid_input" | "not_found" | "request_failed";
