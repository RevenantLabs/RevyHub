export interface AssetStatisticsInput {
  value: string;
}

export interface AssetStatisticsResult {
  summary: string;
}

export type AssetStatisticsErrorCode = "empty_input" | "invalid_input" | "not_found" | "request_failed";
