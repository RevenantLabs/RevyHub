export type LedgerLookupErrorCode = "empty_input" | "invalid_sequence" | "ledger_not_found" | "future_ledger" | "rate_limited" | "request_failed";
export interface LedgerLookupInput { sequence: number }
export interface LedgerLookupResult {
 sequence: number; closedAt: string; observedAt: string;
 successful: number | null; failed: number | null; operations: number | null;
 feePool: string | null; totalCoins: string | null; baseFee: string | null; baseReserve: string | null; protocol: number | null;
}
