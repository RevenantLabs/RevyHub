import type { CadenceStats } from "@/features/ledger-close-cadence/types";

/** Exact median of integer millisecond durations (average of two middle values when even). */
export function medianIntervalMs(durations: number[]): number | null {
  if (durations.length === 0) return null;

  const sorted = [...durations].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[mid]!;
  }

  return Math.floor((sorted[mid - 1]! + sorted[mid]!) / 2);
}

export function calculateCadenceStats(durations: number[]): CadenceStats | null {
  if (durations.length === 0) return null;

  let minMs = durations[0]!;
  let maxMs = durations[0]!;

  for (const duration of durations) {
    if (duration < minMs) minMs = duration;
    if (duration > maxMs) maxMs = duration;
  }

  const medianMs = medianIntervalMs(durations);
  if (medianMs === null) return null;

  return {
    medianMs,
    minMs,
    maxMs,
    intervalCount: durations.length
  };
}
