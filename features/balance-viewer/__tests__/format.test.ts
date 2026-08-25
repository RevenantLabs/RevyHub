import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatAssetLabel,
  totalLiabilities
} from "@/features/balance-viewer/lib/format";

describe("formatAmount", () => {
  it("groups thousands and trims trailing zeros", () => {
    expect(formatAmount("1250.5000000")).toBe("1,250.5");
    expect(formatAmount("1000000.0000000")).toBe("1,000,000");
  });

  it("keeps full precision beyond the float safe range", () => {
    expect(formatAmount("922337203685.4775807")).toBe("922,337,203,685.4775807");
  });

  it("leaves a plain integer untouched apart from grouping", () => {
    expect(formatAmount("42")).toBe("42");
  });
});

describe("formatAssetLabel", () => {
  it("names each balance kind", () => {
    expect(formatAssetLabel({ kind: "native", assetCode: "XLM", balance: "1" })).toMatch(/native/);
    expect(formatAssetLabel({ kind: "credit", assetCode: "USDC", balance: "1" })).toBe("USDC");
    expect(
      formatAssetLabel({ kind: "liquidity_pool", assetCode: "Pool shares", balance: "1" })
    ).toMatch(/pool/i);
  });
});

describe("totalLiabilities", () => {
  it("returns null when no liabilities are reported", () => {
    expect(totalLiabilities({ kind: "credit", assetCode: "USDC", balance: "1" })).toBeNull();
  });

  it("adds both sides without floating-point drift", () => {
    expect(
      totalLiabilities({
        kind: "native",
        assetCode: "XLM",
        balance: "1",
        sellingLiabilities: "0.1000000",
        buyingLiabilities: "0.2000000"
      })
    ).toBe("0.3");
  });
});
