/** A fee expressed both in stroops and in XLM, kept as exact strings. */
export interface StroopAmount {
  stroops: string;
  xlm: string;
}

export interface FeePercentile {
  label: string;
  value: StroopAmount | null;
}

export interface FeeStatsSummary {
  lastLedger: string | null;
  lastLedgerBaseFee: StroopAmount | null;
  /** Fraction of ledger capacity in use, 0-1, as reported by Horizon. */
  capacityUsage: number | null;
  chargedMin: StroopAmount | null;
  chargedMode: StroopAmount | null;
  chargedMax: StroopAmount | null;
  chargedPercentiles: FeePercentile[];
  maxFeeMin: StroopAmount | null;
  maxFeeMode: StroopAmount | null;
  maxFeePercentiles: FeePercentile[];
  fetchedAt: string;
}

export type FeeStatsErrorCode =
  | "endpoint_unreachable"
  | "unexpected_response"
  | "rate_limited"
  | "request_failed";

/** How congested the network is, derived from capacity usage. */
export type CongestionLevel = "calm" | "busy" | "congested" | "unknown";
