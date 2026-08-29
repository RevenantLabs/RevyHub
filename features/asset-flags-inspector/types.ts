export interface AssetFlagsInspectorInput {
  accountId: string;
}

export interface AccountFlags {
  authRequired: boolean;
  authRevocable: boolean;
  authImmutable: boolean;
  authClawbackEnabled: boolean;
}

export interface AssetFlagsInspectorResult {
  accountId: string;
  flags: AccountFlags;
}

export type AssetFlagsInspectorErrorCode =
  | "empty_input"
  | "invalid_address"
  | "account_not_found"
  | "rate_limited"
  | "request_failed";
