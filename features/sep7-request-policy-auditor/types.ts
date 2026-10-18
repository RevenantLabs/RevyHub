export type RawInput = Record<string, string>;

export type ErrorCode =
  | "invalid_uri"
  | "unsupported_operation"
  | "invalid_policy"
  | "destination_denied"
  | "amount_out_of_range"
  | "network_denied";

export interface Sep7Fields {
  operation: string;
  destination: string;
  amount: string;
  assetCode: string;
  assetIssuer: string;
  memo: string;
  networkPassphrase: string;
  callback: string;
  msg: string;
}

export interface PolicyAsset {
  code: string;
  issuer: string;
}

export interface Policy {
  destinations: string[];
  minAmount: string;
  maxAmount: string;
  passphrases: string[];
  callbackHosts: string[];
  assets: PolicyAsset[];
  memos: string[];
}

export interface Verdict {
  field: string;
  passed: boolean;
  code: "ok" | ErrorCode | "callback_blocked" | "asset_denied" | "memo_denied";
  advice: string;
}

export interface AuditReport {
  fields: Sep7Fields;
  policy: Policy;
  verdicts: Verdict[];
}
