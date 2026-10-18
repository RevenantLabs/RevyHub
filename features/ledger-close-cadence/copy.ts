import type { LedgerCloseCadenceErrorCode } from "@/features/ledger-close-cadence/types";
import { SAMPLE_SIZE_MAX, SAMPLE_SIZE_MIN } from "@/features/ledger-close-cadence/types";

export const copy = {
  formLabel: "Sample size",
  formHint: `Whole number from ${SAMPLE_SIZE_MIN} to ${SAMPLE_SIZE_MAX}. Horizon returns the newest ledgers first.`,
  submit: "Measure close cadence",
  refresh: "Measure again",
  loading: "Reading recent ledger closes...",
  emptyTitle: "No cadence sample yet",
  emptyDescription:
    "Fetch a bounded window of recent ledgers and measure the spacing between their close timestamps. A long gap is an observation in the sample — not proof of an outage.",
  resultTitle: "Observed close cadence",
  summaryTitle: "Sample summary",
  intervalsTitle: "Adjacent close intervals",
  gapsTitle: "Sequence gaps",
  noticesTitle: "Sample notices",
  networkLabel: "Network",
  sampleSizeLabel: "Requested sample size",
  observedSizeLabel: "Observed sample size",
  firstLedgerLabel: "Oldest ledger in sample",
  lastLedgerLabel: "Newest ledger in sample",
  medianLabel: "Median interval",
  minLabel: "Minimum interval",
  maxLabel: "Maximum interval",
  intervalCountLabel: "Interval count",
  malformedLabel: "Malformed records skipped",
  repeatedLabel: "Repeated timestamps",
  gapNotice:
    "Missing sequence numbers are listed separately from long close-time gaps. A gap means those ledgers were not in this Horizon page.",
  unusualNotice: "Intervals marked unusual are much longer than the sample median.",
  noGaps: "No sequence discontinuities in this sample.",
  noIntervals: "Need at least two valid ledgers to compute intervals.",
  fromLabel: "From",
  toLabel: "To",
  durationLabel: "Duration",
  unusualBadge: "Unusual spacing",
  repeatedBadge: "Repeated timestamp",
  missingCountLabel: "Missing sequences"
} as const;

export const errorCopy: Record<
  LedgerCloseCadenceErrorCode,
  { title: string; description: string }
> = {
  invalid_sample_size: {
    title: "Sample size is not valid",
    description: `Enter a whole number from ${SAMPLE_SIZE_MIN} to ${SAMPLE_SIZE_MAX}. Smaller samples cannot measure adjacent closes.`
  },
  malformed_ledger: {
    title: "Ledger records could not be used",
    description:
      "Horizon returned records without usable sequence numbers or UTC close times. Try a different sample size or network."
  },
  history_unavailable: {
    title: "Ledger history is unavailable",
    description:
      "Horizon returned no usable ledgers for this request. The endpoint may be catching up or missing history."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Ledger history was requested too often. Wait a moment before measuring again."
  },
  request_failed: {
    title: "The request did not complete",
    description: "Horizon responded with an error or the connection failed. Try again in a moment."
  }
};
