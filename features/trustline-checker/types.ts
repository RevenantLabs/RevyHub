export interface TrustlineInput {
  accountId: string;
  assetCode: string;
  issuerId: string;
}

export interface TrustlineFound {
  exists: true;
  assetCode: string;
  issuerId: string;
  balance: string;
  limit: string;
  authorized: boolean;
  authorizedToMaintainLiabilities: boolean;
}

export interface TrustlineMissing {
  exists: false;
  assetCode: string;
  issuerId: string;
  /** Other trustlines the account holds for the same asset code, if any. */
  otherIssuers: string[];
}

export type TrustlineResult = TrustlineFound | TrustlineMissing;

export type TrustlineErrorCode =
  | "empty_account"
  | "invalid_account"
  | "empty_asset_code"
  | "invalid_asset_code"
  | "empty_issuer"
  | "invalid_issuer"
  | "self_issued"
  | "account_not_found"
  | "rate_limited"
  | "request_failed";

/** Field a validation error belongs to, so the form can highlight it. */
export type TrustlineField = "accountId" | "assetCode" | "issuerId";
