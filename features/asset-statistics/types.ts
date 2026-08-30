export interface AssetStatisticsInput {
  assetCode: string;
  issuerId: string;
}

export interface AuthorizationBreakdown<T> {
  authorized: T;
  liabilitiesOnly: T;
  unauthorized: T;
}

export interface IssuerAuthorizationFlags {
  authRequired: boolean;
  authRevocable: boolean;
  authImmutable: boolean;
  authClawbackEnabled: boolean;
}

export interface AssetStatisticsResult {
  assetCode: string;
  issuerId: string;
  holders: AuthorizationBreakdown<number> & { total: number };
  accountBalances: AuthorizationBreakdown<string> & { total: string };
  claimableBalances: { count: number; amount: string };
  liquidityPools: { count: number; amount: string };
  contracts: { count: number; amount: string };
  circulatingSupply: string;
  flags: IssuerAuthorizationFlags;
}

export type AssetStatisticsErrorCode =
  | "empty_asset_code"
  | "invalid_asset_code"
  | "empty_issuer"
  | "invalid_issuer"
  | "asset_not_found"
  | "rate_limited"
  | "request_failed";

export type AssetStatisticsField = "assetCode" | "issuerId";

export type IssuerFlagKey = keyof IssuerAuthorizationFlags;
