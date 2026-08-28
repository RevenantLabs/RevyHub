import type { CongestionLevel, FeeStatsErrorCode } from "@/features/fee-stats/types";

export const copy = {
  submit: "Load fee statistics",
  refresh: "Refresh",
  loading: "Reading the ledger...",
  emptyTitle: "No fee statistics loaded yet",
  emptyDescription:
    "Fee statistics describe the last few ledgers on the selected network. Load them to see what transactions are actually paying right now.",
  recommendationTitle: "Suggested fee",
  summaryTitle: "Ledger",
  chargedTitle: "Fees actually charged",
  maxFeeTitle: "Fees offered (max fee)",
  chargedExplainer:
    "What transactions actually paid. This is the distribution to bid against.",
  maxFeeExplainer:
    "What transactions were willing to pay. Offering more than the charged fee costs nothing when the ledger is not full — the network only takes what it needs.",
  capacityLabel: "Ledger capacity in use",
  lastLedgerLabel: "Last ledger",
  baseFeeLabel: "Base fee",
  minLabel: "Minimum",
  modeLabel: "Most common",
  maxLabel: "Maximum",
  fetchedAtLabel: "Read at"
} as const;

export const congestionCopy: Record<CongestionLevel, { title: string; description: string }> = {
  calm: {
    title: "The network has spare capacity",
    description:
      "Ledgers are not filling up. The base fee is generally enough, and surge pricing is not in effect."
  },
  busy: {
    title: "Ledgers are filling up",
    description:
      "Some ledgers are close to capacity. Transactions bidding only the minimum may wait or be dropped."
  },
  congested: {
    title: "The network is congested",
    description:
      "Ledgers are near capacity and surge pricing applies. A transaction bidding below the upper percentiles is unlikely to be included."
  },
  unknown: {
    title: "Capacity was not reported",
    description:
      "Horizon did not return a usable capacity figure, so congestion could not be assessed. The fee distribution below is still accurate."
  }
};

export const errorCopy: Record<FeeStatsErrorCode, { title: string; description: string }> = {
  endpoint_unreachable: {
    title: "Could not reach Horizon",
    description: "The request never completed. Check your connection and try again."
  },
  unexpected_response: {
    title: "Horizon returned something unexpected",
    description:
      "The response was not a fee-statistics document. The endpoint may be misconfigured or proxied."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Fee statistics were requested too often. Wait a moment before refreshing."
  },
  request_failed: {
    title: "The request did not complete",
    description: "Horizon responded with an error. Try again in a moment."
  }
};
