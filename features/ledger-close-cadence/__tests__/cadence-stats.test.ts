import { describe, expect, it } from "vitest";
import {
  calculateCadenceStats,
  medianIntervalMs
} from "@/features/ledger-close-cadence/lib/cadence-stats";

describe("medianIntervalMs", () => {
  it("returns the middle value for an odd sample", () => {
    expect(medianIntervalMs([1000, 5000, 3000])).toBe(3000);
  });

  it("averages the two middle values for an even sample", () => {
    expect(medianIntervalMs([1000, 2000, 4000, 8000])).toBe(3000);
  });

  it("returns null for an empty list", () => {
    expect(medianIntervalMs([])).toBeNull();
  });
});

describe("calculateCadenceStats", () => {
  it("reports min, max, median and count", () => {
    expect(calculateCadenceStats([5000, 5000, 5000])).toEqual({
      medianMs: 5000,
      minMs: 5000,
      maxMs: 5000,
      intervalCount: 3
    });
  });

  it("returns null when there are no intervals", () => {
    expect(calculateCadenceStats([])).toBeNull();
  });
});
