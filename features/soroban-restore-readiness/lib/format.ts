import type { LivenessState } from "../types";
import { copy } from "../copy";

/** Presentation-only helpers. Keep formatting out of components and logic. */
export function formatLedger(seq: number): string {
  return seq.toLocaleString("en-US");
}

export function formatLivenessLabel(liveness: LivenessState): string {
  return copy.livenessLabels[liveness.kind];
}

export function formatRemainingLedgers(liveUntilLedgerSeq: number, latestLedger: number): string {
  const delta = liveUntilLedgerSeq - latestLedger;
  if (delta >= 0) return `${formatLedger(delta)} ledger(s) remaining`;
  return `${formatLedger(Math.abs(delta))} ledger(s) past live-until`;
}
