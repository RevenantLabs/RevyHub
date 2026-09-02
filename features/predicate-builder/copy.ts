import type { PredicateBuilderErrorCode } from "@/features/predicate-builder/types";

export const copy = {
  emptyTitle: "No predicate built yet",
  emptyDescription:
    "Build a claimable balance predicate by selecting conditions below. The predicate controls who can claim the balance and when. Everything is generated in your browser — nothing is sent to a server.",

  predicateTypeLabel: "Predicate Type",
  predicateTypeHint: "Choose the type of condition for this predicate.",

  timestampLabel: "Date and Time (UTC)",
  timestampHint: "Enter when this condition becomes active or expires.",
  timestampPlaceholder: "2026-12-31T23:59:59Z",

  secondsLabel: "Duration (seconds)",
  secondsHint: "Number of seconds after the balance was created.",
  secondsPlaceholder: "86400",

  addCondition: "Add Condition",
  removeCondition: "Remove",
  buildPredicate: "Build Predicate",
  encoding: "Building...",
  encodingStatus: "Building the predicate",

  resultTitle: "Claim Predicate Built",
  plainLanguageTitle: "Plain Language Preview",
  plainLanguageIntro: "This balance can be claimed when:",
  xdrTitle: "XDR Encoding",
  xdrLabel: "Claim Predicate XDR (Base64)",

  predicateTypes: {
    unconditional: "Unconditional (always claimable)",
    before_absolute: "Before absolute time",
    before_relative: "Before relative time",
    and: "AND (all conditions must be satisfied)",
    or: "OR (at least one condition must be satisfied)",
    not: "NOT (negates the nested condition)"
  } as const
} as const;

export const errorCopy: Record<
  PredicateBuilderErrorCode,
  { title: string; description: string }
> = {
  empty_predicate: {
    title: "Build a predicate first",
    description: "Add at least one condition to generate XDR."
  },
  invalid_timestamp: {
    title: "Invalid timestamp",
    description:
      "Enter a valid ISO 8601 date-time in UTC (e.g., 2026-12-31T23:59:59Z)."
  },
  invalid_duration: {
    title: "Invalid duration",
    description: "Duration must be a positive integer in seconds."
  },
  invalid_and_children: {
    title: "AND requires at least two conditions",
    description: "Add more conditions or use a different predicate type."
  },
  invalid_or_children: {
    title: "OR requires at least two conditions",
    description: "Add more conditions or use a different predicate type."
  },
  invalid_not_child: {
    title: "NOT requires exactly one nested condition",
    description: "Add a condition to negate."
  },
  unsupported_type: {
    title: "Unsupported predicate type",
    description: "Select a valid predicate type from the dropdown."
  },
  encoding_failed: {
    title: "Failed to encode predicate",
    description:
      "An unexpected error occurred while building the XDR. Check your predicate structure."
  }
};
