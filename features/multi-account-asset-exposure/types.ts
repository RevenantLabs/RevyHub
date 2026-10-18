export interface MultiAccountAssetExposureInput { accountIds: string[] }
export type MultiAccountAssetExposureErrorCode =
  | "invalid_account" | "duplicate_account" | "too_many_accounts"
  | "account_not_found" | "rate_limited" | "request_failed";
export type AccountFailureCode = Extract<MultiAccountAssetExposureErrorCode,
  "account_not_found" | "rate_limited" | "request_failed">;
export interface AssetBalance {
  kind: "native" | "credit";
  code: string;
  issuer: string;
  balance: string;
}
export type AccountRow =
  | { accountId: string; status: "success"; balances: AssetBalance[] }
  | { accountId: string; status: "error"; code: AccountFailureCode };
export interface MatrixRow {
  kind: AssetBalance["kind"];
  code: string;
  issuer: string;
  /** null means an absent trustline or failed fetch; consult account status. */
  balances: (string | null)[];
  total: string;
}
export interface MultiAccountAssetExposureResult {
  accounts: AccountRow[];
  matrix: MatrixRow[];
}
