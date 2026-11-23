import type { ErrorCode } from "@/features/transaction-sequence-gap-auditor/types";

export const copy = {
  accountLabel: "Stellar account",
  formHint: "Enter a public G-address. Secret seeds are never accepted.",
  networkHint: (network: string) => `Transaction history will be read from Stellar ${network}.`,
  submit: "Audit sequence history",
  loading: "Auditing transaction history…",
  emptyTitle: "No sequence audit yet",
  emptyDescription: "Enter a public account to inspect up to 100 recent transactions for sequence gaps.",
  resultTitle: "Sequence audit",
  overviewTitle: "Gap overview",
  coverageTitle: "History coverage",
  gapsTitle: "Sequence gaps",
  noGaps: "No gaps were found in the bounded transaction window.",
  incompleteTitle: "Evidence window is incomplete",
  incompleteDescription:
    "The 100-transaction limit was reached. Boundary gaps are marked as truncated evidence, not claimed as missing transactions.",
  pages: "Pages fetched",
  transactions: "Transactions",
  successful: "Successful",
  failed: "Failed evidence",
  oldest: "Oldest sequence",
  newest: "Newest sequence",
  network: "Network",
  limitReached: "History limit",
  limitReachedValue: "100-transaction limit reached",
  limitNotReachedValue: "Complete within fetched window",
  provedBumps: "Proved bumps",
  unexplained: "Unexplained gaps",
  truncated: "Truncated-boundary gaps",
  afterSequence: "After sequence",
  beforeSequence: "Before sequence",
  missing: "Skipped range",
  evidence: "Evidence",
  bumpEvidence: (hash: string, target: string) => `Bump transaction ${hash} targets sequence ${target}.`,
  noBumpEvidence: "No matching successful bump_sequence operation was found.",
  gapKind: {
    proved_bump: "Proved sequence bump",
    unexplained: "Unexplained gap",
    unexplained_truncated: "Unexplained — history truncated"
  },
  oneSequence: "1 sequence",
  sequences: "sequences",
  testnet: "Testnet",
  mainnet: "Mainnet"
} as const;

export const errorCopy: Record<ErrorCode, { title: string; description: string }> = {
  invalid_input: {
    title: "Enter a valid public G-address",
    description: "Check the account address and try again. Never paste a secret seed."
  },
  malformed_data: {
    title: "Horizon returned malformed data",
    description: "Try again later or switch networks; the response could not be safely audited."
  },
  unsupported_variant: {
    title: "This address variant is unsupported",
    description: "Use the underlying public G-address instead of a muxed or contract address."
  },
  too_large: {
    title: "Horizon returned too many records",
    description: "The response exceeded the bounded page size, so the audit stopped safely."
  },
  not_found: {
    title: "Account not found",
    description: "Confirm that the account exists on the selected network."
  },
  rate_limited: {
    title: "Horizon rate limit reached",
    description: "Wait briefly, then retry the audit."
  },
  request_failed: {
    title: "The Horizon request failed",
    description: "Check your connection and selected network, then try again."
  }
};
