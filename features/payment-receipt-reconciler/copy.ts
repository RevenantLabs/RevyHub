import type { PaymentReceiptReconcilerErrorCode } from "@/features/payment-receipt-reconciler/types";

export const copy = {
  formLabel: "Transaction hash",
  formHint: "64 hexadecimal characters from a completed payment or path-payment.",
  submit: "Reconcile receipt",
  loading: "Reconciling...",
  emptyTitle: "No receipt reconciled yet",
  emptyDescription:
    "Paste a successful payment or path-payment transaction hash to link its operations with account debit and credit effects.",
  resultTitle: "Payment receipt",
  publicReceiptTitle: "Public receipt",
  operationsTitle: "Payment operations",
  effectsTitle: "Effect evidence",
  totalsTitle: "Exact totals",
  outsideTitle: "Outside this receipt",
  outsideDescription:
    "These operations or effects belong to the transaction but are not part of the payment transfer itself.",
  noOutside: "Every operation and effect in this transaction is part of the receipt.",
  feeLabel: "Fee charged",
  networkLabel: "Network",
  ledgerLabel: "Ledger",
  hashLabel: "Transaction hash",
  debitLabel: "Debits",
  creditLabel: "Credits",
  linkedDebits: "Linked debits",
  linkedCredits: "Linked credits",
  operationIdLabel: "Operation ID",
  effectIdLabel: "Effect ID",
  fromLabel: "From",
  toLabel: "To",
  amountLabel: "Amount",
  sourceAmountLabel: "Source amount",
  accountLabel: "Account",
  nativeAsset: "XLM",
  unknownAsset: "Unknown asset",
  copyReceipt: "Copy public receipt",
  copiedReceipt: "Copied"
} as const;

export const errorCopy: Record<
  PaymentReceiptReconcilerErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter a transaction hash",
    description: "Paste the 64-character hash of the payment transaction you want to reconcile."
  },
  invalid_hash: {
    title: "That is not a transaction hash",
    description:
      "Transaction hashes are exactly 64 hexadecimal characters (0-9 and a-f). Account addresses start with G and belong in the Balance Viewer instead."
  },
  transaction_not_found: {
    title: "No transaction with this hash on the selected network",
    description:
      "Check the network switch in the header — a testnet hash does not exist on mainnet, and the reverse is also true."
  },
  transaction_failed: {
    title: "This transaction failed on the ledger",
    description:
      "Only successful payments produce debit and credit effects. Look up a completed payment hash, or inspect the failure in Transaction Lookup."
  },
  unsupported_operation: {
    title: "No payment or path-payment operations in this transaction",
    description:
      "This tool reconciles classic payment and path-payment operations only. Other operation types stay outside the receipt."
  },
  incomplete_effects: {
    title: "Payment effects are incomplete for this transaction",
    description:
      "A supported payment operation is missing a visible debit or credit effect. Horizon may still be indexing — try again in a moment."
  },
  request_failed: {
    title: "Could not reach Horizon",
    description: "The request did not complete. Check your connection and try again."
  }
};

export const operationTypeLabels: Record<string, string> = {
  payment: "Payment",
  path_payment_strict_send: "Path payment (strict send)",
  path_payment_strict_receive: "Path payment (strict receive)"
};

export const effectTypeLabels: Record<string, string> = {
  account_debited: "Account debited",
  account_credited: "Account credited"
};

export const networkLabels: Record<string, string> = {
  testnet: "Testnet",
  mainnet: "Mainnet"
};
