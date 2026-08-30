export type ClaimableBalancesMode = "account" | "balance";

export type ClaimableBalancesInput =
  | { mode: "account"; accountId: string }
  | { mode: "balance"; balanceId: string };

export interface ClaimableBalanceAsset {
  kind: "native" | "credit";
  assetCode?: string;
  assetIssuer?: string;
  label: string;
}

export interface TranslatedClaimant {
  destination: string;
  predicateText: string;
  claimableNow: boolean;
}

export interface ClaimableBalanceSummary {
  id: string;
  amount: string;
  asset: ClaimableBalanceAsset;
  sponsor?: string;
  lastModifiedLedger: number;
  fundedAt: string;
  claimants: TranslatedClaimant[];
}

export interface ClaimableBalancesResult {
  mode: ClaimableBalancesMode;
  query: string;
  balances: ClaimableBalanceSummary[];
}

export type ClaimableBalancesErrorCode =
  | "empty_input"
  | "invalid_input"
  | "balance_not_found"
  | "rate_limited"
  | "request_failed";

/** Field a validation error belongs to, so the form can highlight it. */
export type ClaimableBalancesField = "accountId" | "balanceId";
