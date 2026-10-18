import type { DeadlineBoardErrorCode } from "./types";

export const copy = {
  claimantLabel: "Claimant account", claimantHint: "Enter a public G address. Secret keys are never needed.",
  cursorLabel: "Starting cursor (optional)", cursorHint: "Use the numeric Horizon paging token from an earlier scan.",
  submit: "Check deadlines", loading: "Loading claimable balances…",
  emptyTitle: "Check a claimant's time conditions", emptyDescription: "Scan up to three Horizon pages and inspect current claimable balances and their predicates.",
  resultTitle: "Current claimable balances", pages: (n: number) => `${n} ${n === 1 ? "page" : "pages"} fetched`,
  bounded: "Page limit reached. Enter the final paging token as a starting cursor to continue scanning.",
  datedTitle: "Dated conditions", undatedTitle: "Undated or indeterminate conditions",
  noBalances: "No current claimable balances were returned for this claimant in these pages. This does not establish whether a past balance was claimed.",
  conditionPassed: "Time condition passed; balance remains in the current Horizon list.",
  conditionUpcoming: "Time condition has not passed.",
  indeterminate: "No single reliable expiry can be calculated from this predicate.",
  balanceId: "Balance ID", amount: "Amount", deadline: "Deadline", predicate: "Predicate", absolute: "Absolute", relative: "Relative", nextCursor: "Last paging token",
  unconditional: "Any time", and: "All conditions", or: "Any condition", not: "Not", abs_before: "Before", abs_after: "After", rel_before: "Within this many seconds of creation", rel_after: "At least this many seconds after creation",
  unknownCreation: "Creation time unavailable; a calendar time cannot be calculated."
} as const;

export const errorCopy: Record<DeadlineBoardErrorCode, { title: string; description: string }> = {
  invalid_claimant: { title: "Enter a valid claimant account", description: "Use a public Stellar G address with a valid checksum; do not enter a secret key." },
  invalid_cursor: { title: "Enter a valid paging cursor", description: "Use the numeric paging token shown by this board, with no spaces or other characters." },
  malformed_predicate: { title: "Horizon returned an invalid predicate", description: "The balance conditions could not be read safely. Try again later or inspect the record in Horizon." },
  history_unavailable: { title: "History is unavailable", description: "Horizon cannot serve this cursor or historical context. Restart the scan without a cursor or try another Horizon endpoint." },
  rate_limited: { title: "Horizon is rate limiting requests", description: "Wait a moment, then retry this claimant." },
  request_failed: { title: "Could not load claimable balances", description: "Check your connection and selected network, then retry." }
};
