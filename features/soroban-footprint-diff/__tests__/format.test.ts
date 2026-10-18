import { describe, expect, it } from "vitest";
import { formatChangeLine, formatKeyLabel, formatSummary } from "@/features/soroban-footprint-diff/lib/format";

describe("format helpers", () => {
  it("formats key labels and change lines", () => {
    expect(
      formatKeyLabel({ id: "A", label: "CONTRACT_DATA:A", mode: "read_only" })
    ).toContain("read-only");
    expect(
      formatChangeLine({
        id: "B",
        label: "CONTRACT_DATA:B",
        before: "read_only",
        after: "read_write",
        kind: "mode_changed"
      })
    ).toContain("read-only → read-write");
  });

  it("formats summary counts", () => {
    expect(formatSummary({ added: 1, removed: 2, modeChanges: 3 })).toBe(
      "1 added · 2 removed · 3 mode changes"
    );
  });
});
