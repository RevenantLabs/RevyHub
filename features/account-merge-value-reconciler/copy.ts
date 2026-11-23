import type { AccountMergeValueReconcilerErrorCode as Code, EvidenceGapCode, MergeTransferStatus } from "./types";

export const copy = {
  envelopeLabel: "Transaction envelope XDR",
  resultLabel: "Transaction result XDR",
  metadataLabel: "Transaction metadata XDR",
  inputHint: "Paste base64 XDR from the same confirmed transaction. Processing stays in this browser.",
  metadataHint: "If metadata is unavailable, leave this blank to see the evidence gap.",
  submit: "Reconcile value",
  reset: "Clear result",
  loading: "Reconciling pasted XDR locally…",
  emptyTitle: "No transaction checked yet",
  emptyDescription: "Paste an envelope and result XDR; add metadata to check the balance changes around each merge.",
  resultTitle: "Value reconciliation",
  completeTitle: "Evidence aligned",
  incompleteTitle: "Incomplete evidence",
  compatibilityNote: "These XDR values are checked for compatible structure and merge balance changes. Without a shared transaction hash and network passphrase, their common origin cannot be proven here.",
  fee: "Network fee charged (XLM)",
  proceeds: "Successful merge proceeds (XLM)",
  unrelated: "Unrelated balance changes, net (XLM)",
  unrelatedTitle: "Unrelated balance changes",
  unrelatedEmpty: "No native balance change outside the merges was observed.",
  account: "Account",
  change: "Change (XLM)",
  unavailable: "Unavailable",
  feePayer: "Fee payer",
  transactionSource: "Transaction source",
  metaVersion: "Metadata version",
  transfersTitle: "Merge operations",
  gapsTitle: "Evidence gaps",
  source: "Source",
  destination: "Destination",
  amount: "Transfer (XLM)",
  operation: "Operation",
  status: "Outcome",
  resultCode: "Result code",
  transactionLevel: "Transaction",
  override: "Source origin",
  overrideYes: "Operation source override",
  inherited: "Inherited transaction source"
} as const;

export const statusCopy: Record<MergeTransferStatus, string> = {
  success: "Transferred",
  rolled_back: "Rolled back — the operation succeeded but the transaction failed",
  failed: "Failed — nothing transferred",
  unavailable: "Not applied — the transaction failed before operations ran"
};

export const gapCopy: Record<EvidenceGapCode, string> = {
  missing_metadata: "Operation metadata is absent or lacks the account snapshots needed to verify this transfer. Paste metadata from the confirmed transaction.",
  missing_result: "This merge has no successful transfer amount in the operation result. Check the transaction result XDR.",
  contradictory_metadata: "The destination balance change differs from the merge result amount. Check that all XDR values came from the same transaction.",
  transaction_failed: "The transaction failed; no merge proceeds are asserted even if an operation result says success.",
  fee_payer_change: "Transaction-level metadata changes the fee payer's balance (for example a fee refund). It is kept out of merge proceeds and unrelated changes.",
  no_merge: "This transaction contains no account merge operation. Paste an envelope containing a merge."
};

export const errorCopy: Record<Code, { title: string; description: string }> = {
  invalid_input: { title: "Invalid input", description: "Paste base64 envelope and result XDR. Remove any secret seed and retry." },
  malformed_data: { title: "XDR could not be decoded", description: "Check that each field contains the correct complete XDR type." },
  unsupported_variant: { title: "Unsupported XDR variant", description: "Use a v0, v1 or fee-bump transaction envelope and TransactionMeta version 0–3. Newer metadata versions are not supported by the installed SDK." },
  too_large: { title: "Input is too large", description: "Each XDR field must be at most 262,144 characters." },
  incompatible_transaction: { title: "Inputs disagree", description: "The envelope, result and metadata disagree on fee-bump wrapping, operation count, operation types or maximum fee. Paste all three from one confirmed transaction." }
};
