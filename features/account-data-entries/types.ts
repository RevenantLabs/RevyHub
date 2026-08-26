export interface AccountDataEntriesInput {
  value: string;
}

export interface AccountDataEntriesResult {
  summary: string;
}

export type AccountDataEntriesErrorCode = "empty_input" | "invalid_input" | "not_found" | "request_failed";
