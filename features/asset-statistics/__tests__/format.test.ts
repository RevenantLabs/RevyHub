import { describe, expect, it } from "vitest";
import {
  amountToStroops,
  formatAmount,
  formatInteger,
  normalizeAmount,
  sumAmounts
} from "@/features/asset-statistics/lib/format";

describe("asset amount helpers", () => {
  it("normalizes to exactly seven decimals", () => {
    expect(normalizeAmount("42")).toBe("42.0000000");
    expect(normalizeAmount("42.1")).toBe("42.1000000");
  });

  it("rejects malformed or over-precise amounts", () => {
    expect(amountToStroops("1.00000001")).toBeNull();
    expect(amountToStroops("-1.0000000")).toBeNull();
  });

  it("sums beyond Number.MAX_SAFE_INTEGER without losing a stroop", () => {
    expect(sumAmounts(["9007199254740993.1234567", "0.0000001"])).toBe(
      "9007199254740993.1234568"
    );
  });

  it("groups amounts while preserving all seven decimals", () => {
    expect(formatAmount("9007199254741176.0000000")).toBe(
      "9,007,199,254,741,176.0000000"
    );
  });

  it("groups holder counts", () => {
    expect(formatInteger(12_365)).toBe("12,365");
  });
});
