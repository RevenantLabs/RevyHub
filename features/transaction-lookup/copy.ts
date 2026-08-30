import type { TransactionErrorCode } from "@/features/transaction-lookup/types";

export const copy = {
  formLabel: "Transaction hash",
  formHint: "64 hexadecimal characters, as shown by any Stellar explorer.",
  submit: "Look up transaction",
  loading: "Looking up...",
  emptyTitle: "No transaction looked up yet",
  emptyDescription: "Paste a transaction hash to see its ledger, fee, memo and operations.",
  resultTitle: "Transaction",
  operationsTitle: "Operations",
  succeeded: "This transaction succeeded",
  failed: "This transaction failed",
  resultCodeLabel: "Result code",
  noOperations: "Horizon returned no readable operations for this transaction."
} as const;

export const errorCopy: Record<TransactionErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter a transaction hash",
    description: "Paste the 64-character hash of the transaction you want to inspect."
  },
  invalid_hash: {
    title: "That is not a transaction hash",
    description:
      "Transaction hashes are exactly 64 hexadecimal characters (0-9 and a-f). Account addresses start with G and belong in the Balance Viewer instead."
  },
  not_found: {
    title: "No transaction with this hash on the selected network",
    description:
      "Check the network switch in the header — a testnet hash does not exist on mainnet, and the reverse is also true."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment before looking up another transaction."
  },
  request_failed: {
    title: "Could not reach Horizon",
    description: "The request did not complete. Check your connection and try again."
  }
};
