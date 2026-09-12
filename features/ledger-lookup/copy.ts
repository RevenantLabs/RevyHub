import type { LedgerErrorCode } from "@/features/ledger-lookup/types";

export const copy = {
  formLabel: "Ledger sequence",
  formHint: "Positive integer sequence number of the ledger to inspect.",
  submit: "Look up ledger",
  loading: "Looking up...",
  emptyTitle: "No ledger looked up yet",
  emptyDescription: "Enter a ledger sequence number to inspect its close time, transactions, fee pool and protocol version.",
  resultTitle: "Ledger summary",
  futureLedgerWithHeight: (height: number) =>
    `The requested sequence is higher than the current ledger height (${height.toLocaleString("en-US")}). This ledger has not occurred yet.`,
  closeTimeLabel: "Close time",
  ageLabel: "Age",
  successfulTxLabel: "Successful transactions",
  failedTxLabel: "Failed transactions",
  operationsLabel: "Operations",
  txSetOperationsLabel: "Tx set operations",
  feePoolLabel: "Fee pool",
  totalCoinsLabel: "Total coins",
  baseFeeLabel: "Base fee",
  baseReserveLabel: "Base reserve",
  protocolVersionLabel: "Protocol version",
  maxTxSetSizeLabel: "Max tx set size",
  hashLabel: "Hash",
  prevHashLabel: "Previous hash"
} as const;

export const errorCopy: Record<LedgerErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter a ledger sequence",
    description: "Enter a positive integer representing a ledger sequence number."
  },
  invalid_sequence: {
    title: "Invalid ledger sequence",
    description: "Ledger sequence numbers must be positive integers greater than zero."
  },
  ledger_not_found: {
    title: "Ledger not found",
    description: "This ledger was not found on Horizon. It is outside the retained history range of this Horizon instance."
  },
  future_ledger: {
    title: "Ledger has not occurred yet",
    description: "The requested sequence is higher than the current ledger height on this network."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment before looking up another ledger."
  },
  request_failed: {
    title: "Could not reach Horizon",
    description: "The request did not complete. Check your connection and network selection, then try again."
  }
};
