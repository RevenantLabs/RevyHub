import type { HorizonPaginationErrorCode } from "@/features/horizon-pagination-inspector/types";

export const copy = {
  formLabel: "Horizon response URL or JSON",
  formHint: "Paste a Horizon paginated response URL, JSON body, or a Link header to inspect its pagination.",
  submit: "Inspect",
  loading: "Inspecting...",
  emptyTitle: "No response inspected yet",
  emptyDescription: "Paste a Horizon paginated response to decode its cursors, links, and record count.",
  resultTitle: "Pagination Info",
  recordsLabel: "Records on this page",
  nextCursorLabel: "Next cursor",
  prevCursorLabel: "Previous cursor",
  selfHrefLabel: "Self link",
  hasNextLabel: "Has next page",
  hasPrevLabel: "Has previous page",
  decodeTab: "Decode Response",
  encodeTab: "Build Link",
  templated: "Templated",
  notTemplated: "Direct link",
} as const;

export const errorCopy: Record<
  HorizonPaginationErrorCode,
  { title: string; description: string }
> = {
  empty_input: { title: "Enter a Horizon response", description: "Paste a URL, JSON, or Link header." },
  invalid_response: { title: "Could not parse response", description: "Ensure it is a valid Horizon paginated response." },
  invalid_cursor: { title: "Invalid cursor", description: "The cursor format is not recognized." },
};
