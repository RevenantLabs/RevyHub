import type {
  AccessChange,
  AccessMode,
  FootprintKey
} from "@/features/soroban-footprint-diff/types";

export function diffAccessModes(
  before: FootprintKey[],
  after: FootprintKey[]
): {
  added: FootprintKey[];
  removed: FootprintKey[];
  modeChanges: AccessChange[];
  unchanged: FootprintKey[];
} {
  const beforeMap = new Map(before.map((key) => [key.id, key]));
  const afterMap = new Map(after.map((key) => [key.id, key]));

  const added: FootprintKey[] = [];
  const removed: FootprintKey[] = [];
  const modeChanges: AccessChange[] = [];
  const unchanged: FootprintKey[] = [];

  for (const [id, key] of afterMap) {
    const previous = beforeMap.get(id);
    if (!previous) {
      added.push(key);
      modeChanges.push({
        id,
        label: key.label,
        before: null,
        after: key.mode,
        kind: "added"
      });
      continue;
    }

    if (previous.mode !== key.mode) {
      modeChanges.push({
        id,
        label: key.label,
        before: previous.mode,
        after: key.mode,
        kind: "mode_changed"
      });
    } else {
      unchanged.push(key);
      modeChanges.push({
        id,
        label: key.label,
        before: previous.mode,
        after: key.mode,
        kind: "unchanged"
      });
    }
  }

  for (const [id, key] of beforeMap) {
    if (!afterMap.has(id)) {
      removed.push(key);
      modeChanges.push({
        id,
        label: key.label,
        before: key.mode,
        after: null,
        kind: "removed"
      });
    }
  }

  return {
    added,
    removed,
    modeChanges: modeChanges.filter((change) => change.kind !== "unchanged"),
    unchanged
  };
}

export function formatAccessMode(mode: AccessMode | null): string {
  if (!mode) return "—";
  if (mode === "read_only") return "read-only";
  if (mode === "read_write") return "read-write";
  return "conflict (read-only + read-write)";
}
