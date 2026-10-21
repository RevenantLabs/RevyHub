import type { Durability, LivenessState, RestoreRequirement } from "../types";

/**
 * Explains what restoring the entry would require, without constructing a
 * `RestoreFootprint` operation. Only an archived or pending-eviction
 * `persistent` entry is restorable; a `temporary` entry, once expired, is
 * deleted outright and cannot be restored by any operation.
 */
export function describeRestoreRequirement(
  contractId: string,
  storageKeyXdr: string,
  durability: Durability,
  liveness: LivenessState
): RestoreRequirement {
  if (liveness.kind === "expired_temporary") {
    return {
      restorable: false,
      explanation:
        "Temporary entries are deleted once their live-until ledger passes. There is no RestoreFootprint " +
        "operation that can bring this entry back — recreating it requires a new write."
    };
  }

  if (liveness.kind === "live") {
    return {
      restorable: false,
      explanation:
        "This entry is still live. A RestoreFootprint operation is only meaningful once an entry has expired."
    };
  }

  // liveness.kind is "archived" or "pending_eviction", and durability is
  // necessarily "persistent" here (see classifyLiveness).
  void durability;
  return {
    restorable: true,
    explanation:
      "Restoring requires a RestoreFootprint operation whose read-write footprint names exactly this ledger key " +
      `(contract ${contractId}, this same storage key XDR, durability "persistent"). The operation re-establishes ` +
      "a fresh live-until ledger for the entry; it does not change, and cannot change, the value already stored " +
      `at the key ${storageKeyXdr.slice(0, 12)}…`
  };
}
