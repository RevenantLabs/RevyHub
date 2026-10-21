export interface Sep24TransactionStatusTrackerInput {
  homeDomain: string;
  transactionId: string;
  token: string;
}

export type Sep24Kind = "deposit" | "withdrawal" | "unknown";

export interface Sep24TransactionStatusTrackerResult {
  homeDomain: string;
  transferServer: string;
  transactionId: string;
  kind: Sep24Kind;
  status: string;
  explanation: string;
  nextStep: string;
  amountIn: string | null;
  amountOut: string | null;
  amountFee: string | null;
  moreInfoUrl: string | null;
}

export type Sep24TransactionStatusTrackerErrorCode =
  | "invalid_home_domain"
  | "missing_transfer_server"
  | "invalid_transaction_id"
  | "unauthorized"
  | "transaction_not_found"
  | "request_failed";

export type Sep24Field = "homeDomain" | "transactionId" | "token";
