import { describe, expect, it } from "vitest";
import {
  entryKey,
  formatTimeRemaining,
  groupEntriesByKind
} from "@/features/contract-storage/lib/format";
import type { StorageEntry } from "@/features/contract-storage/types";

describe("formatTimeRemaining", () => {
  it("returns null for an unknown remaining count", () => {
    expect(formatTimeRemaining(null)).toBeNull();
  });

  it("returns 'expired' for zero or negative ledgers", () => {
    expect(formatTimeRemaining(0)).toBe("expired");
    expect(formatTimeRemaining(-10)).toBe("expired");
  });

  it("formats remaining ledgers as approximate wall-clock time", () => {
    expect(formatTimeRemaining(1)).toBe("~5s");
    expect(formatTimeRemaining(12)).toBe("~1m 0s");
    expect(formatTimeRemaining(720)).toBe("~1h 0m");
    expect(formatTimeRemaining(17280)).toBe("~1d 0h");
  });
});

describe("entryKey", () => {
  it("includes kind, index and a stable prefix of the key", () => {
    const entry: StorageEntry = {
      key: "counter",
      value: "42",
      kind: "instance",
      liveUntilLedger: 100,
      ledgersRemaining: 10
    };

    expect(entryKey(entry, 0)).toBe("instance-0-counter");
  });
});

describe("groupEntriesByKind", () => {
  it("separates entries by durability kind", () => {
    const entries: StorageEntry[] = [
      { key: "a", value: "1", kind: "instance", liveUntilLedger: 1, ledgersRemaining: 1 },
      { key: "b", value: "2", kind: "persistent", liveUntilLedger: 2, ledgersRemaining: 2 },
      { key: "c", value: "3", kind: "temporary", liveUntilLedger: 3, ledgersRemaining: 3 }
    ];

    const groups = groupEntriesByKind(entries);
    expect(groups.instance).toHaveLength(1);
    expect(groups.persistent).toHaveLength(1);
    expect(groups.temporary).toHaveLength(1);
    expect(groups.instance[0]?.key).toBe("a");
  });
});
