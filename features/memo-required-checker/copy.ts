import type { MemoRequiredCheckerErrorCode } from "@/features/memo-required-checker/types";

export const copy = {
  accountLabel: "Destination account",
  accountHint: "A G-address. Secret seeds are rejected and never sent.",
  submit: "Check memo requirement",
  loading: "Checking memo signals...",
  emptyTitle: "No account checked yet",
  emptyDescription:
    "Enter a destination account to see whether SEP-29 or its stellar.toml says a payment memo is required.",
  resultTitle: "Memo requirement",
  bestEffortTitle: "Best-effort check",
  verdictRequired: "Memo required",
  verdictNotRequired: "Memo not required",
  conflictNote: "The data entry and stellar.toml disagree. A memo is still reported as required.",
  dataEntryTitle: "config.memo_required",
  tomlTitle: "stellar.toml MEMO_REQUIRED",
  signalRequired: "Requires a memo",
  signalNotRequired: "Says a memo is not required",
  signalAbsent: "No signal",
  sourcesLabel: "Sources that require a memo",
  sourcesNone: "Neither source requires a memo",
  sourceDataEntry: "SEP-29 data entry",
  sourceToml: "stellar.toml",
  homeDomainLabel: "Home domain",
  notPublished: "Not published"
} as const;

export const errorCopy: Record<
  MemoRequiredCheckerErrorCode,
  { title: string; description: string }
> = {
  invalid_account: {
    title: "Enter a valid destination account",
    description: "Use a Stellar G-address. Secret seeds are rejected before any request is made."
  },
  account_not_found: {
    title: "That account was not found",
    description: "Horizon has no account for this address on the selected network."
  },
  malformed_data_entry: {
    title: "config.memo_required is not a SEP-29 value",
    description: "The data entry is present, but its value is not the single character 1. That is not treated as not-required."
  },
  toml_unreachable: {
    title: "The stellar.toml could not be fetched",
    description: "This account publishes a home domain, but /.well-known/stellar.toml did not load. That is not a not-required result."
  },
  rate_limited: {
    title: "Horizon is rate limiting this check",
    description: "Wait a moment and try the same account again."
  },
  request_failed: {
    title: "The account could not be read",
    description: "Horizon did not return a usable account record. Try again on the selected network."
  }
};
