import { describe, expect, it } from "vitest";
import { toStroopAmount } from "@/features/fee-stats/lib/stroops";
import {
  BUSY_THRESHOLD,
  CONGESTED_THRESHOLD,
  congestionOf,
  formatCapacityUsage,
  formatFee,
  recommendFee
} from "@/features/fee-stats/lib/format";

describe("toStroopAmount", () => {
  it("converts stroops to XLM exactly", () => {
    expect(toStroopAmount("100")).toEqual({ stroops: "100", xlm: "0.0000100" });
    expect(toStroopAmount("10000000")).toEqual({ stroops: "10000000", xlm: "1.0000000" });
  });

  it("stays exact beyond the float safe range", () => {
    expect(toStroopAmount("9223372036854775807")?.xlm).toBe("922337203685.4775807");
  });

  it("strips leading zeros without changing the value", () => {
    expect(toStroopAmount("0000100")?.stroops).toBe("100");
  });

  it("returns null for anything that is not a non-negative integer", () => {
    expect(toStroopAmount("abc")).toBeNull();
    expect(toStroopAmount("-5")).toBeNull();
    expect(toStroopAmount("1.5")).toBeNull();
    expect(toStroopAmount("")).toBeNull();
    expect(toStroopAmount(null)).toBeNull();
    expect(toStroopAmount(undefined)).toBeNull();
    expect(toStroopAmount(-1)).toBeNull();
  });

  it("accepts a safe integer number", () => {
    expect(toStroopAmount(100)).toEqual({ stroops: "100", xlm: "0.0000100" });
  });
});

describe("congestionOf", () => {
  it("classifies each band at its boundary", () => {
    expect(congestionOf(0)).toBe("calm");
    expect(congestionOf(BUSY_THRESHOLD - 0.01)).toBe("calm");
    expect(congestionOf(BUSY_THRESHOLD)).toBe("busy");
    expect(congestionOf(CONGESTED_THRESHOLD - 0.01)).toBe("busy");
    expect(congestionOf(CONGESTED_THRESHOLD)).toBe("congested");
    expect(congestionOf(1)).toBe("congested");
  });

  it("reports unknown when capacity was not reported", () => {
    expect(congestionOf(null)).toBe("unknown");
  });
});

describe("formatCapacityUsage", () => {
  it("renders a fraction as a percentage", () => {
    expect(formatCapacityUsage(0.081)).toBe("8.1%");
    expect(formatCapacityUsage(null)).toBe("Not reported");
  });
});

describe("formatFee", () => {
  it("shows stroops and XLM together", () => {
    expect(formatFee({ stroops: "100", xlm: "0.0000100" })).toBe("100 stroops (0.00001 XLM)");
  });

  it("says so when a value is missing", () => {
    expect(formatFee(null)).toBe("Not reported");
  });
});

describe("recommendFee", () => {
  const percentiles = [
    { label: "P50", value: { stroops: "1200", xlm: "0.0001200" } },
    { label: "P90", value: { stroops: "9000", xlm: "0.0009000" } },
    { label: "P99", value: { stroops: "35000", xlm: "0.0035000" } }
  ];

  it("bids the median on a calm ledger", () => {
    expect(recommendFee(percentiles, "calm").amount?.stroops).toBe("1200");
  });

  it("bids higher as the ledger fills", () => {
    expect(recommendFee(percentiles, "busy").amount?.stroops).toBe("9000");
    expect(recommendFee(percentiles, "congested").amount?.stroops).toBe("35000");
  });

  it("falls back to P90 when congestion is unknown", () => {
    expect(recommendFee(percentiles, "unknown").amount?.stroops).toBe("9000");
  });

  it("always states the basis for the recommendation", () => {
    for (const level of ["calm", "busy", "congested", "unknown"] as const) {
      expect(recommendFee(percentiles, level).basis).toMatch(/recently charged fees/);
    }
  });
});
