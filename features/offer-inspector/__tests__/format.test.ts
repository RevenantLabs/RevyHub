import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatAsset,
  formatPrice,
  formatPriceRatio,
  formatShortAddress,
  stroopsToXlm
} from "@/features/offer-inspector/lib/format";
import { accountId, issuerId } from "@/features/offer-inspector/fixtures/offerInspector.fixture";

describe("formatAmount", () => {
  it("formats integer amounts without trailing zeros", () => {
    expect(formatAmount("100.0000000")).toBe("100");
  });

  it("adds comma grouping to large numbers and preserves non-zero decimals", () => {
    expect(formatAmount("1234567.8900000")).toBe("1,234,567.89");
  });

  it("handles zero gracefully", () => {
    expect(formatAmount("0.0000000")).toBe("0");
  });
});

describe("formatPriceRatio and formatPrice", () => {
  it("formats price ratio correctly", () => {
    expect(formatPriceRatio(1, 2)).toBe("1 / 2");
  });

  it("combines decimal price and fractional ratio", () => {
    expect(formatPrice("0.5000000", { n: 1, d: 2 })).toBe("0.5 (1 / 2)");
  });
});

describe("stroopsToXlm", () => {
  it("converts base reserve stroops to exact XLM string", () => {
    expect(stroopsToXlm(5_000_000n)).toBe("0.5");
    expect(stroopsToXlm(10_000_000n)).toBe("1");
    expect(stroopsToXlm(0n)).toBe("0");
  });

  it("handles non-round fractional stroops without floating point issues", () => {
    expect(stroopsToXlm(12_345_678n)).toBe("1.2345678");
  });

  it("handles negative stroops", () => {
    expect(stroopsToXlm(-5_000_000n)).toBe("-0.5");
  });
});

describe("formatAsset", () => {
  it("returns native label for native assets", () => {
    expect(formatAsset({ isNative: true, code: "XLM", label: "XLM (native)" })).toBe(
      "XLM (native)"
    );
  });

  it("returns code for issued assets", () => {
    expect(
      formatAsset({ isNative: false, code: "USDC", issuer: issuerId, label: `USDC:${issuerId}` })
    ).toBe("USDC");
  });
});

describe("formatShortAddress", () => {
  it("returns dash for missing address", () => {
    expect(formatShortAddress(undefined)).toBe("-");
  });

  it("returns short strings unchanged", () => {
    expect(formatShortAddress("GABC123")).toBe("GABC123");
  });

  it("truncates long addresses to 6...6", () => {
    expect(formatShortAddress(accountId)).toBe(
      `${accountId.slice(0, 6)}...${accountId.slice(-6)}`
    );
  });
});

