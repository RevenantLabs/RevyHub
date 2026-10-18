import type { CongestionLevel, StroopAmount } from "@/features/fee-stats/types";

/** Thresholds are stated here rather than inline so the UI and tests agree. */
export const BUSY_THRESHOLD = 0.5;
export const CONGESTED_THRESHOLD = 0.9;

export function congestionOf(usage: number | null): CongestionLevel {
  if (usage === null) return "unknown";
  if (usage >= CONGESTED_THRESHOLD) return "congested";
  if (usage >= BUSY_THRESHOLD) return "busy";
  return "calm";
}

export function formatCapacityUsage(usage: number | null): string {
  return usage === null ? "Not reported" : `${(usage * 100).toFixed(1)}%`;
}

export function formatFee(amount: StroopAmount | null): string {
  if (!amount) return "Not reported";
  const xlm = amount.xlm.replace(/0+$/, "").replace(/\.$/, ".0");
  return `${amount.stroops} stroops (${xlm} XLM)`;
}

/**
 * Recommends a fee from the charged distribution.
 *
 * The reasoning is deliberately simple and stated in the UI: pay the p90 of
 * what actually cleared recently. Bidding the mode is enough on a calm ledger
 * and not enough on a congested one, and a recommendation the reader cannot
 * reason about is worse than no recommendation.
 */
export function recommendFee(
  percentiles: { label: string; value: StroopAmount | null }[],
  congestion: CongestionLevel
): { amount: StroopAmount | null; basis: string } {
  const pick = (label: string) => percentiles.find((p) => p.label === label)?.value ?? null;

  if (congestion === "congested") {
    return { amount: pick("P99"), basis: "P99 of recently charged fees — the ledger is close to full" };
  }
  if (congestion === "busy") {
    return { amount: pick("P90"), basis: "P90 of recently charged fees — the ledger is filling up" };
  }
  if (congestion === "calm") {
    return { amount: pick("P50"), basis: "P50 of recently charged fees — the ledger has spare capacity" };
  }
  return { amount: pick("P90"), basis: "P90 of recently charged fees — capacity was not reported" };
}
