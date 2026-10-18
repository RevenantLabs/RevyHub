import type { LedgerProtocolTransitionMapErrorCode } from "@/features/ledger-protocol-transition-map/types";
import { COUNT_MAX, COUNT_MIN } from "@/features/ledger-protocol-transition-map/types";

export const copy = {
  startLabel: "Start ledger",
  startHint: "Inclusive sequence number where the scan begins.",
  countLabel: "Ledger count",
  countHint: `Whole number from ${COUNT_MIN} to ${COUNT_MAX}. Bounded history only.`,
  submit: "Map protocol transitions",
  loading: "Scanning ledger protocol versions...",
  emptyTitle: "No protocol map yet",
  emptyDescription:
    "Scan a bounded ledger range and group adjacent protocol versions. Exact transitions are marked only when both neighboring sequences were fetched.",
  summaryTitle: "Scan summary",
  runsTitle: "Protocol version runs",
  transitionsTitle: "Transitions",
  gapsTitle: "Gaps and uncertain boundaries",
  networkLabel: "Network",
  rangeLabel: "Scanned range",
  requestedLabel: "Requested count",
  observedLabel: "Observed count",
  summaryLabel: "Copyable summary",
  copySummary: "Copy summary",
  copiedSummary: "Summary copied",
  partialPageNotice:
    "Horizon returned a partial page before the requested count was filled. Transitions at the trailing edge are uncertain.",
  gapNotice:
    "A missing ledger between two fetched records prevents an exact transition boundary.",
  noTransitions: "No protocol version changes in this scan.",
  noGaps: "No sequence gaps in the fetched sample.",
  exactBadge: "Exact",
  uncertainBadge: "Uncertain",
  runLabel: "Protocol",
  ledgersLabel: "Ledgers"
} as const;

export const errorCopy: Record<
  LedgerProtocolTransitionMapErrorCode,
  { title: string; description: string }
> = {
  invalid_start_ledger: {
    title: "Start ledger is not valid",
    description: "Enter a positive whole-number ledger sequence where the scan should begin."
  },
  invalid_count: {
    title: "Ledger count is not valid",
    description: `Enter a whole number from ${COUNT_MIN} to ${COUNT_MAX}. Larger scans are out of scope.`
  },
  history_unavailable: {
    title: "Ledger history is unavailable",
    description:
      "Horizon returned no usable ledgers for this range. The endpoint may be catching up or missing history."
  },
  malformed_ledger: {
    title: "Ledger records could not be used",
    description:
      "Horizon returned records without usable sequence numbers or protocol versions. Try another range."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Ledger history was requested too often. Wait a moment before scanning again."
  },
  request_failed: {
    title: "The request did not complete",
    description: "Horizon responded with an error or the connection failed. Try again in a moment."
  }
};
