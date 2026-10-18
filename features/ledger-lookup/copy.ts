import type { LedgerLookupErrorCode } from "./types";
export const copy = {
 formLabel: "Ledger sequence", formHint: "Enter a positive ledger sequence from 1 to 4294967295 on the selected network.", submit: "Look up ledger", loading: "Loading ledger…", reset: "Reset",
 emptyTitle: "Resolve a ledger sequence", emptyDescription: "See its close time, counts, fee pool, monetary totals and protocol version.", resultTitle: "Ledger details",
 unavailable: "Unavailable", currentHeight: "Current Horizon height", sequence: "Ledger sequence", closedAt: "Closed at (UTC)", age: "Age at observation", observedAt: "Observed at (UTC)", successful: "Successful transactions", failed: "Failed transactions", operations: "Operations", feePool: "Fee pool (XLM)", totalCoins: "Total coins (XLM)", baseFee: "Base fee (stroops)", baseReserve: "Base reserve (stroops)", protocol: "Protocol version",
 secondsAgo: (seconds: number) => `${seconds} seconds before observation`, afterObservation: "Close time is after the observation clock; check clock synchronization."
} as const;
export const errorCopy: Record<LedgerLookupErrorCode, {title: string; description: string}> = {
 empty_input: {title:"Enter a ledger sequence",description:"Type the positive sequence number you want to inspect."},
 invalid_sequence: {title:"Invalid ledger sequence",description:"Use a whole number from 1 to 4294967295, without signs, decimals or scientific notation."},
 ledger_not_found: {title:"Ledger is not available",description:"The ledger is outside this provider's retained history or is unavailable. Check the sequence and use a provider retaining that history."},
 future_ledger: {title:"Ledger has not been ingested yet",description:"Choose a sequence at or below the current Horizon height shown here, or wait and retry."},
 rate_limited: {title:"Horizon rate limit reached",description:"Wait before retrying the ledger lookup."},
 request_failed: {title:"Ledger lookup did not complete",description:"Check your connection and retry. The provider may be unavailable or returning incomplete data."}
};
