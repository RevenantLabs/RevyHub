export interface AssetFlagsInspectorInput {
  issuerId: string;
}

export interface IssuerAuthorizationFlags {
  authRequired: boolean;
  authRevocable: boolean;
  authClawbackEnabled: boolean;
  authImmutable: boolean;
}

export interface AssetFlagsInspectorResult {
  issuerId: string;
  flags: IssuerAuthorizationFlags;
  /** Plain-language overview of what these flags mean for holders. */
  summary: string;
  /** Warnings and combinations worth calling out explicitly. */
  callouts: string[];
}

export type AssetFlagsInspectorErrorCode =
  | "empty_input"
  | "invalid_address"
  | "account_not_found"
  | "rate_limited"
  | "request_failed";
