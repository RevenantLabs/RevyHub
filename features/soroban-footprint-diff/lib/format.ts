import { formatAccessMode } from "@/features/soroban-footprint-diff/lib/access-diff";
import type {
  AccessChange,
  FootprintKey
} from "@/features/soroban-footprint-diff/types";

export function formatKeyLabel(key: FootprintKey): string {
  return `${key.label} (${formatAccessMode(key.mode)})`;
}

export function formatChangeLine(change: AccessChange): string {
  return `${change.label}: ${formatAccessMode(change.before)} → ${formatAccessMode(change.after)}`;
}

export function formatSummary(counts: {
  added: number;
  removed: number;
  modeChanges: number;
}): string {
  return `${counts.added} added · ${counts.removed} removed · ${counts.modeChanges} mode changes`;
}
