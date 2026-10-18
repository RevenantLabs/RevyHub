import type { HashReport } from "../types";

export function formatLedger(sequence: number | null): string {
  return sequence === null ? "unknown" : String(sequence);
}

export function formatVerdict(report: HashReport): string {
  const snapshot = report.atomic ? "same ledger" : "not an atomic snapshot";
  return `${report.verdict}; ${snapshot}; instance ${formatLedger(report.instance.marker.latestLedger)}`;
}
