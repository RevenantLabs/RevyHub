export interface TransactionOperation {
  id: string;
  type: string;
  sourceAccount: string;
}

export interface TransactionSummary {
  hash: string;
  ledger: number;
  successful: boolean;
  sourceAccount: string;
  feeCharged: string;
  maxFee: string;
  operationCount: number;
  createdAt: string;
  memoType: string;
  memo?: string;
  /** Present on failed transactions. */
  resultCode?: string;
  operations: TransactionOperation[];
}

export interface TransactionInput {
  hash: string;
}

export type TransactionErrorCode =
  | "empty_input"
  | "invalid_hash"
  | "not_found"
  | "rate_limited"
  | "request_failed";
