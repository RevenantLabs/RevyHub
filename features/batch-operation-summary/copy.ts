import type { BatchOperationSummaryErrorCode } from "@/features/batch-operation-summary/types";

export const copy = {
  formLabel: "Transaction envelope XDR",
  formHint: "Paste a base64 transaction envelope. It is decoded only in this browser.",
  submit: "Summarize operations",
  working: "Decoding…",
  emptyTitle: "No envelope decoded",
  emptyDescription: "Paste an envelope to count operations, native XLM and source overrides.",
  resultTitle: "Batch summary",
  operationTotal: "Operations",
  nativeTotal: "Native XLM moved",
  nativeOnly: "Native-only total; issued assets are not combined.",
  typeTitle: "Operation types",
  type: "Type",
  count: "Count",
  sourceTitle: "Source accounts",
  transactionSource: "Transaction source",
  overrideSource: "Operation override",
  noOverrides: "No operation-level source overrides."
} as const;

export const errorCopy: Record<BatchOperationSummaryErrorCode, { title: string; description: string }> = {
  empty_xdr: { title: "Paste an envelope", description: "Provide a base64 transaction envelope XDR to continue." },
  invalid_xdr: { title: "Envelope could not be decoded", description: "Check that the value is complete base64 transaction-envelope XDR." },
  unsupported_operation: { title: "An operation is unsupported", description: "Use an envelope containing operation kinds supported by this SDK version." },
  too_large: { title: "Envelope is too large", description: "Use an envelope smaller than 200,000 characters." }
};
