import type { MultisigAnalyzerErrorCode, ThresholdLevel } from "@/features/multisig-analyzer/types";

export const copy = {
  envelopeLabel: "Transaction envelope XDR",
  envelopeHint: "Paste the base64-encoded transaction envelope. The tool reads it locally and never signs or submits.",
  sourceAccountLabel: "Source account",
  sourceAccountHint: "The public G-address whose signer weights and thresholds should be checked.",
  submit: "Analyze signatures",
  loading: "Analyzing transaction...",
  emptyTitle: "No transaction analyzed yet",
  emptyDescription:
    "Paste an envelope and the source account to see which threshold each operation needs and which signatures are still missing.",
  resultTitle: "Multisig signature analysis",
  sourceAccountLabelText: "Source account",
  transactionSourceLabel: "Transaction source",
  requiredThresholdLabel: "Required threshold",
  currentWeightLabel: "Current signature weight",
  shortfallLabel: "Still missing",
  missingSignerLabel: "Signer(s) that can still close the gap",
  unattributedLabel: "Unattributed signatures",
  noRemaining: "No remaining signer combination can meet the requirement.",
  thresholdLabels: {
    low: "Low",
    medium: "Medium",
    high: "High"
  } satisfies Record<ThresholdLevel, string>
} as const;

export const errorCopy: Record<MultisigAnalyzerErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Paste the envelope and source account",
    description: "Both a transaction envelope and a public G-address are required before the signers can be evaluated."
  },
  invalid_xdr: {
    title: "That envelope does not decode as a Stellar transaction",
    description: "Confirm you pasted a valid base64-encoded transaction envelope, not a signed payload or a random string."
  },
  account_not_found: {
    title: "This source account does not exist on the selected network",
    description: "Check the network switch in the header and the account address. A funded source account is required to evaluate thresholds."
  },
  signer_lookup_failed: {
    title: "The account was found, but its signers could not be read",
    description: "Try again in a moment. The account resolved, but Horizon did not return the signer list needed for the analysis."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment, then try the analysis again."
  },
  request_failed: {
    title: "The signer analysis did not complete",
    description: "Check your connection and try again. If the failure continues, Horizon may be temporarily unavailable."
  }
};
