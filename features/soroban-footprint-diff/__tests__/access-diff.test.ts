import { describe, expect, it } from "vitest";
import { diffAccessModes } from "@/features/soroban-footprint-diff/lib/access-diff";

describe("diffAccessModes", () => {
  it("reports additions, removals and mode changes", () => {
    const diff = diffAccessModes(
      [
        { id: "A", label: "A", mode: "read_only" },
        { id: "B", label: "B", mode: "read_only" },
        { id: "C", label: "C", mode: "read_write" }
      ],
      [
        { id: "A", label: "A", mode: "read_only" },
        { id: "B", label: "B", mode: "read_write" },
        { id: "D", label: "D", mode: "read_write" }
      ]
    );

    expect(diff.added.map((key) => key.id)).toEqual(["D"]);
    expect(diff.removed.map((key) => key.id)).toEqual(["C"]);
    expect(diff.modeChanges.find((change) => change.id === "B")).toMatchObject({
      kind: "mode_changed",
      before: "read_only",
      after: "read_write"
    });
  });
});
