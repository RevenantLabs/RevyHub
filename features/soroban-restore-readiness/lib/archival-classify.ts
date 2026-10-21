import type { Durability, LedgerResult, LivenessState } from "../types";

/**
 * Classifies liveness from a `getLedgerEntries` response.
 *
 * An empty response for a `persistent` key is handled by the caller as the
 * `entry_not_found` error — this tool has no archive-layer marker to classify
 * in that shape, so it does not guess. An empty response for a `temporary`
 * key reaches this function, because temporary entries are deleted outright
 * once expired: "not found" *is* the informative "expired" signal for them,
 * not an error.
 */
export function classifyLiveness(result: LedgerResult, durability: Durability): LivenessState {
  const row = result.entries[0];

  if (!row) {
    return { kind: "expired_temporary" };
  }

  if (row.liveUntilLedgerSeq === undefined) {
    // The archive layer returned the entry's last known data with no
    // current TTL. Only meaningful for `persistent` entries; a `temporary`
    // entry in this shape is treated the same as fully expired.
    return durability === "temporary" ? { kind: "expired_temporary" } : { kind: "archived" };
  }

  if (row.liveUntilLedgerSeq >= result.latestLedger) {
    return { kind: "live", liveUntilLedgerSeq: row.liveUntilLedgerSeq };
  }

  return durability === "temporary"
    ? { kind: "expired_temporary" }
    : { kind: "pending_eviction", liveUntilLedgerSeq: row.liveUntilLedgerSeq };
}
