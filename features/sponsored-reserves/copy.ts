import type { SponsoredReservesErrorCode } from "@/features/sponsored-reserves/types";

export const copy = {
  formLabel: "Value",
  formHint: "TODO: explain what to paste here.",
  submit: "Run",
  emptyTitle: "Nothing checked yet",
  emptyDescription: "TODO: describe what the user will see after running the tool.",
  resultTitle: "Result"
} as const;

export const errorCopy: Record<SponsoredReservesErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter a value first",
    description: "TODO"
  },
  invalid_input: {
    title: "That value is not valid",
    description: "TODO"
  },
  not_found: {
    title: "Not found",
    description: "TODO"
  },
  request_failed: {
    title: "The request did not complete",
    description: "TODO"
  }
};
