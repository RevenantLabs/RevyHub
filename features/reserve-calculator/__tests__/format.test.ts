import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatLedger,
  stroopsToAmount
} from "@/features/reserve-calculator/lib/format";

describe("stroopsToAmount", () => {
  it("preserves all seven decimal places", () => {
    expect(stroopsToAmount(9_223_372_036_854_775_807n)).toBe("922337203685.4775807");
    expect(stroopsToAmount(-5_000_000n)).toBe("-0.5000000");
  });
});

describe("formatAmount", () => {
  it("groups whole XLM and trims trailing zeroes", () => {
    expect(formatAmount("1250.5000000")).toBe("1,250.5 XLM");
    expect(formatAmount("0.0000000")).toBe("0 XLM");
  });

  it("uses a typographic minus for adjustments", () => {
    expect(formatAmount("-1.0000000")).toBe("−1 XLM");
  });
});

describe("formatLedger", () => {
  it("groups a ledger sequence", () => {
    expect(formatLedger(1_234_567)).toBe("1,234,567");
  });
});
