import type { StorageEntry } from "@/features/contract-storage/types";

const MS_PER_LEDGER = 5000;

/**
 * Estimates the wall-clock time remaining for a ledger entry.
 *
 * Stellar ledgers close at roughly 5 seconds on average, but this is an
 * estimate, not a guarantee. Callers should label it as such in the UI.
 */
export function formatTimeRemaining(ledgersRemaining: number | null): string | null {
  if (ledgersRemaining === null) return null;
  if (ledgersRemaining <= 0) return "expired";

  const ms = ledgersRemaining * MS_PER_LEDGER;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `~${days}d ${hours % 24}h`;
  if (hours > 0) return `~${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `~${minutes}m ${seconds % 60}s`;
  return `~${seconds}s`;
}

/**
 * Returns a stable, readable key suitable for a React list key.
 */
export function entryKey(entry: StorageEntry, index: number): string {
  return `${entry.kind}-${index}-${entry.key.slice(0, 32)}`;
}

/**
 * Groups storage entries by durability kind, preserving the original order
 * within each group.
 */
export function groupEntriesByKind(
  entries: StorageEntry[]
): Record<StorageEntry["kind"], StorageEntry[]> {
  const groups: Record<StorageEntry["kind"], StorageEntry[]> = {
    instance: [],
    persistent: [],
    temporary: []
  };

  for (const entry of entries) {
    groups[entry.kind].push(entry);
  }

  return groups;
}
