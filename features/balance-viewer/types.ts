export type BalanceKind = "native" | "credit" | "liquidity_pool";

export interface DisplayBalance {
  kind: BalanceKind;
  /** "XLM" for the native asset, the asset code for credit balances. */
  assetCode: string;
  /** Issuer address for credit balances, pool id for pool shares. */
  issuer?: string;
  balance: string;
  /** Amount held back by open offers and pool participation. */
  sellingLiabilities?: string;
  buyingLiabilities?: string;
  /** Present on credit balances only. */
  limit?: string;
  authorized?: boolean;
}

export interface AccountBalances {
  accountId: string;
  balances: DisplayBalance[];
  subentryCount: number;
}

export interface BalanceViewerInput {
  accountId: string;
}

export type BalanceViewerErrorCode =
  | "empty_input"
  | "invalid_address"
  | "account_not_found"
  | "rate_limited"
  | "request_failed";
