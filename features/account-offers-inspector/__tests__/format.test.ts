import { describe, it, expect } from "vitest";
import { formatPrice, formatAssetDisplay, formatTimestamp } from "@/features/account-offers-inspector/lib/format";

describe("formatPrice", () => {
  it("formats whole number price", () => {
    expect(formatPrice(1, 1)).toBe("1.0000000");
  });
  it("formats fractional price", () => {
    expect(formatPrice(3, 2)).toBe("1.5000000");
  });
  it("handles zero denominator", () => {
    expect(formatPrice(1, 0)).toBe("0");
  });
});

describe("formatAssetDisplay", () => {
  it("returns XLM for native", () => {
    expect(formatAssetDisplay("XLM")).toBe("XLM");
  });
  it("truncates issuer for credit assets", () => {
    const display = formatAssetDisplay("USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN");
    expect(display).toContain("USDC");
    expect(display).toContain("...");
  });
});

describe("formatTimestamp", () => {
  it("formats ISO timestamp", () => {
    const result = formatTimestamp("2026-01-15T10:30:00Z");
    expect(result).toContain("2026");
  });
  it("returns raw string for invalid date", () => {
    expect(formatTimestamp("invalid")).toBe("Invalid Date");
  });
});
