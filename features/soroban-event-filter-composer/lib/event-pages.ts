import type { StellarNetwork } from "@/core/network/types";
import type { EventRow } from "../types";

export const MAX_EVENT_ROWS = 20;

export interface TaggedPage {
  network: StellarNetwork;
  rows: EventRow[];
  cursor?: string;
}

/**
 * Pages belong to the RPC endpoint that issued the cursor.
 * A network change drops the previous page and its cursor.
 */
export function mergeEventPages(previous: TaggedPage | null, next: TaggedPage): TaggedPage & { truncated: boolean } {
  const sameNetwork = previous?.network === next.network;
  const combined = sameNetwork ? [...previous.rows, ...next.rows] : [...next.rows];
  return {
    network: next.network,
    rows: combined.slice(0, MAX_EVENT_ROWS),
    cursor: next.cursor,
    truncated: combined.length > MAX_EVENT_ROWS
  };
}

export function cursorForNetwork(cursor: string, cursorNetwork: string | undefined, network: StellarNetwork): string | undefined {
  const value = cursor.trim();
  if (!value || cursorNetwork !== network) return undefined;
  return value;
}
