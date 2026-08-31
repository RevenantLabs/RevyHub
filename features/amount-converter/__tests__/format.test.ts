import { describe, expect, it } from "vitest";
import { amountToStroops, formatAmount, formatStroops, stroopsToAmount } from "@/features/amount-converter/lib/format";

describe("stroopsToAmount", () => {
  it("preserves all seven decimal places", () => {
    expect(stroopsToAmount(9_223_372_036_854_775_807n)).toBe("922337203685.4775807");
    expect(stroopsToAmount(1n)).toBe("0.0000001");
    expect(stroopsToAmount(10_000_000n)).toBe("1.0000000");
  });
});

describe("amountToStroops", () => {
  it("converts decimal amounts to stroops without floating-point drift", () => {
    expect(amountToStroops("922337203685.4775807")).toBe(9_223_372_036_854_775_807n);
    expect(amountToStroops("0.0000001")).toBe(1n);
    expect(amountToStroops("1.2")).toBe(12_000_000n);
  });
});

describe("formatStroops", () => {
  it("groups stroops for display", () => {
    expect(formatStroops("10000000")).toBe("10,000,000 stroops");
    expect(formatStroops("9223372036854775807")).toBe("9,223,372,036,854,775,807 stroops");
  });
});

describe("formatAmount", () => {
  it("groups whole units and trims trailing zeroes", () => {
    expect(formatAmount("1250.5000000")).toBe("1,250.5");
    expect(formatAmount("0.0000000")).toBe("0");
  });
});
