import { describe, expect, it } from "vitest";
import {
  formatAssetLabel,
  formatFeeBasisPoints,
  formatFixed,
  formatPricePair,
  impliedPrice,
  parseAmount,
  shareValue
} from "@/features/liquidity-pool-inspector/lib/format";

describe("parseAmount", () => {
  it("parses 7-decimal Stellar amounts into fixed-point bigint values", () => {
    expect(parseAmount("10000.0000000")).toBe(100000000000n);
    expect(parseAmount("0.25")).toBe(2500000n);
  });
});

describe("formatFixed", () => {
  it("renders fixed-point values without floating point", () => {
    expect(formatFixed(2500000n)).toBe("0.25");
    expect(formatFixed(100000000000n)).toBe("10000");
  });
});

describe("impliedPrice", () => {
  it("computes B per 1 A from reserve amounts", () => {
    const amountA = parseAmount("10000.0000000");
    const amountB = parseAmount("2500.0000000");

    expect(impliedPrice(amountA, amountB)).toBe("0.25");
    expect(impliedPrice(amountB, amountA)).toBe("4");
  });

  it("returns zero when the denominator reserve is empty", () => {
    expect(impliedPrice(0n, parseAmount("1"))).toBe("0");
  });
});

describe("shareValue", () => {
  it("derives reserve backing per share", () => {
    const reserve = parseAmount("10000.0000000");
    const shares = parseAmount("1000.0000000");

    expect(shareValue(reserve, shares)).toBe("10");
  });
});

describe("formatAssetLabel", () => {
  it("labels native assets as XLM", () => {
    expect(formatAssetLabel({ assetType: "native" })).toBe("XLM");
  });

  it("shows code and issuer for credit assets", () => {
    expect(
      formatAssetLabel({
        assetType: "credit",
        assetCode: "USDC",
        assetIssuer: "GISSUER"
      })
    ).toBe("USDC:GISSUER");
  });
});

describe("formatFeeBasisPoints", () => {
  it("shows basis points and a percentage", () => {
    expect(formatFeeBasisPoints(30)).toBe("30 bps (0.30%)");
  });
});

describe("formatPricePair", () => {
  it("formats both directions with asset labels", () => {
    expect(formatPricePair("XLM", "USDC", "0.25", "4")).toEqual({
      aToB: "1 XLM ≈ 0.25 USDC",
      bToA: "1 USDC ≈ 4 XLM"
    });
  });
});
