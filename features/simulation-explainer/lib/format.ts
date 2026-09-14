import type { SimulationResourceUsage } from "@/features/simulation-explainer/types";

const STROOPS_PER_XLM = 10_000_000n;

/**
 * Converts a stroop string into a human-readable XLM amount.
 *
 * Stellar amounts are always 7 decimals, so this uses BigInt to avoid losing
 * precision on large values.
 */
export function formatStroopsToXlm(stroops: string): string {
  const value = BigInt(stroops);
  const whole = value / STROOPS_PER_XLM;
  const fraction = (value % STROOPS_PER_XLM).toString().padStart(7, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

/**
 * Groups large numbers with comma separators.
 */
export function formatCount(value: string | number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Returns a short label for a simulation outcome kind.
 */
export function formatOutcomeKind(kind: "success" | "failure" | "restore"): string {
  if (kind === "success") return "Simulation succeeded";
  if (kind === "failure") return "Simulation failed";
  return "Restore required";
}

/**
 * Returns the total ledger entry count touched by the simulation.
 */
export function totalLedgerEntries(resources: SimulationResourceUsage): number {
  return resources.ledgerReadEntries + resources.ledgerWriteEntries;
}
