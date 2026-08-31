import type { SequenceInspectorErrorCode } from "@/features/sequence-inspector/types";

export const copy = {
  accountLabel: "Stellar account address",
  accountHint: "Enter a public G-address. The lookup uses the network selected in the header.",
  accountPlaceholder: "G...",
  bumpLabel: "Bump target (optional)",
  bumpHint: "Enter exact decimal digits. The target must be above the current sequence and at most 9223372036854775807.",
  bumpPlaceholder: "For example, 5000000000000000000",
  submit: "Inspect sequence",
  loading: "Reading account sequence...",
  emptyTitle: "No account inspected yet",
  emptyDescription: "Enter a public account address to decode its sequence number and check an optional bump target.",
  resultTitle: "Sequence details",
  currentSequence: "Current sequence",
  nextSequence: "Next valid transaction sequence",
  noNextSequence: "No valid int64 sequence remains",
  creationLedger: "Encoded ledger prefix (high 32 bits)",
  offset: "Sequence offset (low 32 bits)",
  creationLedgerMaximum: "Maximum for this creation-ledger prefix",
  sequenceUpdatedLedger: "Sequence last changed in ledger",
  account: "Account",
  copyCurrent: "current sequence",
  copyNext: "next sequence",
  copyBump: "bump target",
  structureTitle: "How the number is structured",
  structureDescription: "At account creation, the high 32 bits encode the creation ledger and the low 32 bits start its offset. The prefix maximum sets every low bit to 1.",
  bumpPrefixWarning: "This target crosses the displayed prefix maximum, so it also changes the sequence’s high 32-bit ledger prefix. The original creation ledger can no longer be recovered from the sequence alone afterward.",
  horizonLedgerNote: "Horizon’s sequence_ledger is different: it records the ledger where the current sequence value was last changed.",
  bumpTitle: "Bump-sequence effect",
  bumpTarget: "Resulting sequence",
  bumpIncrease: "Increase from current",
  bumpDescription: "A bump-sequence operation would raise the account sequence to this target. This inspector does not build or submit that operation.",
  txBadSeqTitle: "Why tx_bad_seq happens",
  txBadSeqDescription: "A normal transaction must use the account’s next valid sequence shown above. A stale, skipped, or already-consumed value can be rejected as tx_bad_seq.",
  exhaustedDescription: "This account is already at the signed int64 maximum, so it cannot be the source of another classic transaction.",
  reset: "Inspect another account"
} as const;

export const errorCopy: Record<SequenceInspectorErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter an account address",
    description: "Paste the public G-address whose sequence number you want to inspect."
  },
  invalid_address: {
    title: "That is not a valid public account address",
    description: "Check the G-address for missing or changed characters. Never enter a secret key."
  },
  invalid_bump_target: {
    title: "Choose a higher bump target",
    description: "Use positive decimal digits greater than the account’s current sequence and no greater than the signed int64 maximum."
  },
  account_not_found: {
    title: "Account not found on this network",
    description: "Check the address and selected network. An account funded on testnet does not exist on mainnet, and the reverse is also true."
  },
  request_failed: {
    title: "Could not read the account from Horizon",
    description: "Check your connection and try again. If the problem continues, wait for the selected network’s Horizon service to recover."
  }
};
