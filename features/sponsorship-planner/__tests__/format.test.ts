import { describe, expect, it } from "vitest";
import {
  amountToStroops,
  formatAmount,
  formatStroops,
  reserveCostStroops,
  reserveUnitsLabel,
  stroopsToAmount
} from "@/features/sponsorship-planner/lib/format";

describe("amountToStroops", () => {
  it("parses whole and fractional amounts exactly", () => {
    expect(amountToStroops("1.0000000")).toBe(10_000_000n);
    expect(amountToStroops("0.5000000")).toBe(5_000_000n);
    expect(amountToStroops("100")).toBe(1_000_000_000n);
  });

  it("throws on amounts that are not valid Stellar amounts", () => {
    expect(() => amountToStroops("1.23456789")).toThrow();
    expect(() => amountToStroops("abc")).toThrow();
  });
});

describe("stroopsToAmount", () => {
  it("formats stroops as trimmed amounts without Number", () => {
    expect(stroopsToAmount("5000000")).toBe("0.5");
    expect(stroopsToAmount("10000000")).toBe("1");
    expect(stroopsToAmount("-2500000")).toBe("-0.25");
  });

  it("keeps precision beyond Number.MAX_SAFE_INTEGER", () => {
    expect(stroopsToAmount("9223372036854775807")).toBe("922337203685.4775807");
  });
});

describe("formatAmount", () => {
  it("groups an XLM amount string and appends the unit", () => {
    expect(formatAmount("100")).toBe("100 XLM");
    expect(formatAmount("5.5")).toBe("5.5 XLM");
  });

  it("formats a negative amount with a minus glyph", () => {
    expect(formatAmount("-0.5")).toBe("−0.5 XLM");
  });
});

describe("formatStroops", () => {
  it("converts stroops straight to a grouped, unit-suffixed display", () => {
    expect(formatStroops("1000000000")).toBe("100 XLM");
    expect(formatStroops("55000000")).toBe("5.5 XLM");
    expect(formatStroops("0")).toBe("0 XLM");
    expect(formatStroops("-5000000")).toBe("−0.5 XLM");
  });
});

describe("reserveCostStroops", () => {
  it("multiplies reserve units by the base reserve exactly", () => {
    expect(reserveCostStroops(2, "5000000")).toBe("10000000");
    expect(reserveCostStroops(5, "5000000")).toBe("25000000");
  });
});

describe("reserveUnitsLabel", () => {
  it("pluralises reserve units", () => {
    expect(reserveUnitsLabel(1)).toBe("1 reserve unit");
    expect(reserveUnitsLabel(5)).toBe("5 reserve units");
  });
});
