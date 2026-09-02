import type { ContractEventsErrorCode } from "@/features/contract-events/types";

export const copy = {
  formLabel: "Contract ID",
  startLedgerLabel: "Start ledger",
  endLedgerLabel: "End ledger",
  formHint:
    "Paste a Soroban contract ID starting with C, then choose the first and last ledger to search.",
  retentionHint: (window: number) =>
    `RPC nodes typically retain events for the last ${window.toLocaleString()} ledgers (~24 hours).`,
  submit: "Fetch events",
  loading: "Fetching events...",
  emptyTitle: "No events fetched yet",
  emptyDescription:
    "Paste a Soroban contract ID and a ledger range to see the events it emitted on the selected network.",
  resultTitle: "Contract events",
  eventCount: (count: number) => `${count} event${count === 1 ? "" : "s"} found`,
  latestLedgerLabel: "Latest ledger",
  rangeLabel: "Ledger range",
  retentionWindowLabel: "Retention window",
  contractIdLabel: "Contract ID",
  eventTableCaption: "Events emitted by the contract",
  ledgerColumn: "Ledger",
  closedAtColumn: "Closed at",
  typeColumn: "Type",
  topicColumn: "Topic",
  valueColumn: "Value",
  callColumn: "Call",
  successfulCall: "Success",
  failedCall: "Failed",
  noEventsTitle: "No events in this range",
  noEventsDescription:
    "The range is valid, but the RPC node returned no matching events. Try widening the range or switching network.",
  availableRangeTitle: "Available range",
  availableRange: (start: number, end: number) =>
    `Try ledgers ${start.toLocaleString()} through ${end.toLocaleString()}.`
} as const;

export const errorCopy: Record<ContractEventsErrorCode, { title: string; description: string }> = {
  empty_contract_id: {
    title: "Enter a contract ID",
    description: "Paste a Soroban contract ID starting with C to fetch its events."
  },
  invalid_contract_id: {
    title: "That is not a valid contract ID",
    description:
      "The value failed the contract-address checksum. Confirm it starts with C and was copied in full."
  },
  invalid_ledger_range: {
    title: "The ledger range is not valid",
    description:
      "Start and end ledgers must be whole numbers, and the start ledger cannot be greater than the end ledger."
  },
  range_outside_retention: {
    title: "The ledger range is outside the retention window",
    description:
      "Soroban RPC nodes keep events for a limited number of ledgers. Choose a range that falls within the available window."
  },
  no_events: {
    title: "No events found in this range",
    description:
      "The contract exists, but it emitted no events matching the requested range. Try a wider range."
  },
  rpc_error: {
    title: "The RPC node returned an error",
    description: "The Soroban RPC endpoint reported a problem. Wait a moment and try again."
  },
  request_failed: {
    title: "Could not reach the RPC node",
    description: "The request did not complete. Check your connection and try again."
  }
};
