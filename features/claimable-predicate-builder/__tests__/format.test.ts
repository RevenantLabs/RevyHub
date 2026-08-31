import { describe, expect, it } from "vitest";
import {
  describePredicate,
  formatDuration,
  formatSummary,
  formatTimestamp,
  computeTimeline,
  isUnsatisfiable
} from "@/features/claimable-predicate-builder/lib/format";

describe("formatSummary", () => {
  it("trims the value", () => {
    expect(formatSummary(" example ")).toBe("example");
  });
});

describe("formatTimestamp", () => {
  it("formats a Unix ms timestamp as UTC", () => {
    expect(formatTimestamp(0)).toBe("1970-01-01 00:00:00 UTC");
  });
});

describe("formatDuration", () => {
  it("formats seconds", () => {
    expect(formatDuration(30_000)).toBe("30 seconds");
  });

  it("formats days, hours and minutes", () => {
    expect(formatDuration(90_060_000)).toBe("1 day, 1 hour, 1 minute");
  });
});

describe("describePredicate", () => {
  it("describes an unconditional predicate", () => {
    expect(describePredicate({ type: "unconditional" })).toBe("can be claimed at any time");
  });

  it("describes an absolute-before predicate", () => {
    expect(describePredicate({ type: "abs_before", timestamp: 0 })).toContain("before");
  });

  it("describes a relative-after predicate", () => {
    expect(describePredicate({ type: "rel_after", seconds: 3600 })).toContain("at least");
  });

  it("describes an and predicate", () => {
    const predicate = {
      type: "and" as const,
      children: [
        { type: "unconditional" } as const,
        { type: "unconditional" } as const
      ]
    };
    expect(describePredicate(predicate)).toContain("and");
  });
});

describe("computeTimeline", () => {
  it("returns the full timeline for an unconditional predicate", () => {
    expect(computeTimeline({ type: "unconditional" })).toEqual([{ from: 0, to: null }]);
  });

  it("returns an empty timeline for an unsatisfiable predicate", () => {
    const predicate = {
      type: "and" as const,
      children: [
        { type: "abs_before", timestamp: 1000 } as const,
        { type: "abs_after", timestamp: 2000 } as const
      ]
    };
    expect(computeTimeline(predicate)).toEqual([]);
  });
});

describe("isUnsatisfiable", () => {
  it("detects a contradictory and predicate", () => {
    const predicate = {
      type: "and" as const,
      children: [
        { type: "abs_before", timestamp: 1000 } as const,
        { type: "abs_after", timestamp: 2000 } as const
      ]
    };
    expect(isUnsatisfiable(predicate)).toBe(true);
  });

  it("does not flag a satisfiable predicate", () => {
    expect(isUnsatisfiable({ type: "unconditional" })).toBe(false);
  });
});
