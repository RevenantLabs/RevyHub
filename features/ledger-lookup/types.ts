export type LedgerErrorCode =
  | "empty_input"
  | "invalid_sequence"
  | "ledger_not_found"
  | "future_ledger"
  | "rate_limited"
  | "request_failed";

export interface LedgerErrorDetail {
  currentHeight?: number;
}

export interface LedgerInput {
  sequence: number;
}

export interface LedgerSummary {
  sequence: number;
  hash: string;
  prevHash: string;
  closedAt: string;
  successfulTransactionCount: number;
  failedTransactionCount: number;
  operationCount: number;
  txSetOperationCount: number | null;
  totalCoins: string;
  feePool: string;
  baseFeeInStroops: number;
  baseReserveInStroops: number;
  maxTxSetSize: number;
  protocolVersion: number;
  headerXdr: string;
}

export type LedgerLookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; ledger: LedgerSummary }
  | { status: "error"; code: LedgerErrorCode; detail?: LedgerErrorDetail };
