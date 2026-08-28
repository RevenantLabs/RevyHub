export interface AssetStatisticsInput {
  assetCode: string;
  issuerId: string;
}

export interface AssetStatisticsResult {
  assetCode: string;
  issuerId: string;
  supply: string;
  claimableBalancesAmount: string;
  numClaimableBalances: number;
  flags: {
    authRequired: boolean;
    authRevocable: boolean;
    authImmutable: boolean;
    clawbackEnabled: boolean;
  };
  accounts: {
    authorized: number;
    authorizedToMaintainLiabilities: number;
    unauthorized: number;
  };
  balances: {
    authorized: string;
    authorizedToMaintainLiabilities: string;
    unauthorized: string;
  };
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
