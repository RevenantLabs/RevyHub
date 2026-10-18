import type { AccountActivityRollupErrorCode } from "@/features/account-activity-rollup/types";

export const copy = {
  manifestTitle: "Account Activity Rollup",
  manifestDescription: "Summarize fetched account operations by type and UTC ledger day, with a visible history boundary.",
  manifestCharacter: "A ledger analyst who marks the edge of every observed window.",
  formLabel: "Account address",
  formHint: "Enter a public Stellar account address starting with G. Never enter a secret key.",
  submit: "Summarize activity",
  loading: "Loading activity…",
  loadingPage: "Loading next page…",
  emptyTitle: "No activity loaded yet",
  emptyDescription: "Enter an account to summarize its recent Horizon operations by type and UTC ledger day.",
  resultTitle: "Account activity rollup",
  typeTitle: "By operation type",
  dayTitle: "By UTC ledger day",
  coverageTitle: "Observed history boundary",
  coveragePrefix: "This aggregate includes",
  coverageSuffix: "unique records across",
  coveragePage: "fetched page",
  coveragePages: "fetched pages",
  coverageRange: "Observed UTC days",
  coverageMore: "Older history may exist. Load the next page to extend this window.",
  coverageEnd: "This fetched window has ended. Horizon may retain only bounded history, so these are not all-time totals.",
  noActivityTitle: "No operations in available history",
  noActivityDescription: "This account exists on the selected network, but Horizon returned no operations.",
  loadMore: "Load next page",
  networkLabel: "Selected network"
} as const;

export const errorCopy: Record<AccountActivityRollupErrorCode, { title: string; description: string }> = {
  invalid_account: { title: "Enter a valid public account address", description: "Check the G-address and try again. Secret keys are not accepted." },
  account_not_found: { title: "Account not found", description: "Check the address and selected network, then try again." },
  history_unavailable: { title: "Operation history unavailable", description: "Horizon cannot serve this account's operation history right now. Try again later or use another Horizon instance." },
  invalid_cursor: { title: "Invalid history cursor", description: "Reload this account's activity to start again from the newest page." },
  rate_limited: { title: "Horizon rate limit reached", description: "Wait a moment before loading activity again." },
  request_failed: { title: "Activity request failed", description: "Check your connection and try again." }
};
