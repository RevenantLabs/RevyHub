import type { ClaimablePredicateBuilderErrorCode } from "@/features/claimable-predicate-builder/types";

export const copy = {
  formLabel: "Predicate JSON",
  formHint:
    "Paste a JSON predicate tree. Example: {\"type\":\"abs_before\",\"timestamp\":1893456000000}",
  submit: "Build predicate",
  emptyTitle: "No predicate yet",
  emptyDescription:
    "Describe who can claim a balance and when by entering a JSON predicate tree. You will get the plain-English description, the XDR, and a claimability timeline.",
  resultTitle: "Predicate result",
  descriptionLabel: "Description",
  xdrLabel: "XDR (base64)",
  timelineLabel: "Claimability timeline",
  timelineFrom: "From",
  timelineTo: "to",
  timelineUnbounded: "forever",
  unsatisfiableLabel: "Unsatisfiable",
  unsatisfiableValue: "This predicate can never be satisfied."
} as const;

export const errorCopy: Record<
  ClaimablePredicateBuilderErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter a predicate first",
    description: "Paste a JSON predicate tree into the field and try again."
  },
  invalid_input: {
    title: "Invalid predicate JSON",
    description: "The input is not valid JSON or does not match the expected predicate shape."
  },
  invalid_time_bound: {
    title: "Invalid time bound",
    description: "Absolute timestamps must be non-negative numbers and relative offsets must be non-negative integers."
  },
  too_deeply_nested: {
    title: "Predicate is too deeply nested",
    description: "Reduce the nesting depth of the predicate tree and try again."
  },
  unsatisfiable: {
    title: "Unsatisfiable predicate",
    description: "The predicate can never be true, so no one would be able to claim the balance."
  },
  encoding_failed: {
    title: "Encoding failed",
    description: "The predicate could not be encoded as Stellar XDR. Check the input and try again."
  }
};
