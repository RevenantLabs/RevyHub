import { describe, expect, it } from "vitest";
import {
  formatAmountString,
  formatRationalApproximate,
  formatRationalDisplay,
  parseAmountString,
  parseRationalPrice,
  subtractAmounts
} from "@/features/offer-liability-headroom/lib/rational-price";

describe("rational-price", () => {
  it("reduces and displays rationals exactly", () => {
    const price = parseRationalPrice({ n: 2, d: 4 });
    expect(price).toEqual({ n: 1n, d: 2n });
    expect(formatRationalDisplay(1n, 2n)).toBe("1/2");
    expect(formatRationalApproximate(1n, 2n)).toBe("0.5");
  });

  it("parses and subtracts amount strings without float drift", () => {
    expect(parseAmountString("25.0000000")).toBe(250_000_000n);
    expect(formatAmountString(250_000_000n)).toBe("25");
    expect(subtractAmounts("100.0000000", "25.0000000")).toBe("75");
  });

  it("rejects invalid rationals and amounts", () => {
    expect(parseRationalPrice({ n: 0, d: 1 })).toBeNull();
    expect(parseAmountString("1.12345678")).toBeNull();
  });
});
