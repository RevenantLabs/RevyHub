import type { ErrorCode } from "./types";

export const copy = {
  title: "Soroban Event Filter Composer",
  description:
    "Build a getEvents filter from contract IDs, an event type and topic selectors, then preview the exact JSON-RPC parameters before an optional bounded read.",
  submit: "Run filter",
  loading: "Reading events…",
  reset: "Reset",
  emptyTitle: "Compose a filter first",
  emptyDescription:
    "Add one or more C… contract IDs, an optional topic list, and the first ledger to read. A valid filter can still return no events.",
  resultTitle: "Matching events",
  previewTitle: "getEvents parameters",
  retentionTitle: "RPC retention window",
  noRows: "No events matched this filter inside the retained window.",
  truncated: "Showing the first 20 events. Narrow the filter to see a smaller page.",
  rejected: "Secret keys are discarded and never sent.",
  fields: {
    contractIds: {
      label: "Contract IDs",
      hint: "One or more C… contract IDs, separated by spaces or commas. Maximum 5.",
      multiline: true
    },
    eventType: {
      label: "Event type",
      hint: "All omits the type field. Contract, system and diagnostic are sent as written.",
      options: ["All", "Contract", "System", "Diagnostic"],
      default: "All"
    },
    topics: {
      label: "Topic selectors",
      hint: "Comma-separated * wildcards, sym:name symbols, or base64 ScVal XDR. Maximum 5.",
      multiline: true
    },
    startLedger: {
      label: "Start ledger",
      hint: "Positive ledger sequence. Values older than this endpoint's oldest ledger are rejected."
    },
    limit: {
      label: "Page size",
      hint: "Optional. Defaults to 10 and cannot exceed 20."
    },
    cursor: {
      label: "Pagination cursor",
      hint: "Sent only when it was issued by the network currently selected in the header."
    }
  },
  labels: {
    startLedger: "Start ledger",
    oldestLedger: "Oldest retained ledger",
    latestLedger: "Latest ledger",
    cursor: "Next cursor"
  }
} as const;

export const errorCopy: Record<ErrorCode, { title: string; description: string }> = {
  invalid_contract_id: {
    title: "Invalid contract ID",
    description: "Enter 1 to 5 contract IDs that start with C and pass the StrKey checksum. Secret seeds are rejected."
  },
  invalid_topic: {
    title: "Invalid topic selector",
    description: "Use *, a sym:name of 1–32 letters, digits or underscores, or canonical base64 ScVal XDR."
  },
  invalid_start_ledger: {
    title: "Invalid start ledger",
    description: "Use a positive ledger sequence, and keep the page size between 1 and 20."
  },
  history_unavailable: {
    title: "History is outside the retention window",
    description: "Choose a start ledger at or after the oldest ledger this RPC endpoint still retains, then run the filter again."
  },
  rate_limited: {
    title: "RPC rate limit",
    description: "Wait a moment and run the same filter again. The composed parameters are still on this page."
  },
  request_failed: {
    title: "Event request failed",
    description: "The RPC endpoint did not return events. Check the selected network and run the filter again."
  }
};
