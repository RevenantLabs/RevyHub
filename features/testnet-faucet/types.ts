export interface FaucetInput {
  accountId: string;
}

export interface FaucetSuccess {
  accountId: string;
  /** Hash of the transaction Friendbot submitted, when it reports one. */
  transactionHash?: string;
  ledger?: number;
}

export type FaucetErrorCode =
  | "empty_input"
  | "invalid_address"
  | "already_funded"
  | "rate_limited"
  | "friendbot_unavailable"
  | "request_failed";
