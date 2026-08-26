export interface AssetFlagsInspectorInput {
  value: string;
}

export interface AssetFlagsInspectorResult {
  summary: string;
}

export type AssetFlagsInspectorErrorCode = "empty_input" | "invalid_input" | "not_found" | "request_failed";
