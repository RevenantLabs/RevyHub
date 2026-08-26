export interface ReserveCalculatorInput {
  accountId: string;
}

export interface ReserveBreakdown {
  baseAccount: string;
  subentries: string;
  sponsoring: string;
  sponsored: string;
}

export interface ReserveCalculatorResult {
  accountId: string;
  ledgerSequence: number;
  baseReserve: string;
  nativeBalance: string;
  sellingLiabilities: string;
  minimumBalance: string;
  spendableBalance: string;
  subentryCount: number;
  numSponsoring: number;
  numSponsored: number;
  belowMinimum: boolean;
  breakdown: ReserveBreakdown;
}

export type ReserveCalculatorErrorCode =
  | "empty_input"
  | "invalid_address"
  | "account_not_found"
  | "rate_limited"
  | "request_failed";
