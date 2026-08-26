import type { SequenceInspectorErrorCode } from "@/features/sequence-inspector/types";

export const copy = {
  formLabel: "Account address",
  formHint: "Paste a Stellar account address starting with G.",
  bumpLabel: "Bump target (optional)",
  bumpHint: "A new sequence number to jump to.",
  submit: "Inspect sequence",
  loading: "Inspecting...",
  emptyTitle: "Sequence Number Inspector",
  emptyDescription: "Enter an account address to see its current sequence number, how it was derived, and how a bump operation would change it.",
  resultTitle: "Sequence Details",
  currentSequence: "Current Sequence",
  nextSequence: "Next Valid Sequence",
  ledgerDerived: "Ledger-Derived Maximum",
  ledgerExplainer: "Stellar sequence numbers are 64-bit integers. Since Protocol 10, the high 32 bits represent the ledger in which the account was created, and the low 32 bits are a counter (offset).",
  txBadSeq: "Understanding tx_bad_seq",
  txBadSeqExplainer: "A tx_bad_seq error occurs when a transaction's sequence number does not exactly match the account's next valid sequence. It must be exactly one greater than the current sequence, unless you use a bump-sequence operation.",
  bumpTargetValid: "Bump Target is Valid",
} as const;

export const errorCopy: Record<SequenceInspectorErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter an account address",
    description: "Paste a Stellar address starting with G to inspect its sequence."
  },
  invalid_address: {
    title: "That is not a valid account address",
    description: "The value failed Stellar's checksum check. Confirm it starts with G and was copied in full."
  },
  invalid_bump_target: {
    title: "Invalid bump target",
    description: "The bump target must be a positive 64-bit integer (max 9223372036854775807) and strictly greater than the account's current sequence number."
  },
  account_not_found: {
    title: "This account does not exist on the selected network",
    description: "Accounts only exist once they are funded. Check the network switch in the header."
  },
  request_failed: {
    title: "Could not reach Horizon",
    description: "The request did not complete. Check your connection and try again."
  }
};
