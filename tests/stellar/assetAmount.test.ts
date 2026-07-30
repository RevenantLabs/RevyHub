import { describe, expect, it } from "vitest";
import {
  formatAssetAmount,
  formatStroopsAsXLM
} from "../../lib/stellar/assetAmount";

describe("formatAssetAmount", () => {
  it("trims trailing zeros from seven-digit Stellar balances", () => {
    expect(formatAssetAmount("100.0000000")).toBe("100");
    expect(formatAssetAmount("0.5000000")).toBe("0.5");
    expect(formatAssetAmount("42.0000000")).toBe("42");
  });

  it("preserves significant fractional digits exactly", () => {
    expect(formatAssetAmount("100.0000001")).toBe("100.0000001");
    expect(formatAssetAmount("0.0000001")).toBe("0.0000001");
    expect(formatAssetAmount("99999999999.9999999")).toBe("99999999999.9999999");
  });

  it("preserves inputs that are already trimmed", () => {
    expect(formatAssetAmount("0.5")).toBe("0.5");
    expect(formatAssetAmount("100")).toBe("100");
    expect(formatAssetAmount("0")).toBe("0");
  });

  it("normalizes zero inputs regardless of the trailing decimal form", () => {
    expect(formatAssetAmount("0")).toBe("0");
    expect(formatAssetAmount("0.0")).toBe("0");
    expect(formatAssetAmount("0.0000000")).toBe("0");
    expect(formatAssetAmount("-0")).toBe("0");
    expect(formatAssetAmount("-0.0")).toBe("0");
  });

  it("keeps negative amounts intact without binary float conversion", () => {
    expect(formatAssetAmount("-100.0000000")).toBe("-100");
    expect(formatAssetAmount("-0.5000000")).toBe("-0.5");
    expect(formatAssetAmount("-100.0000001")).toBe("-100.0000001");
  });

  it("trims surrounding whitespace before formatting", () => {
    expect(formatAssetAmount("  100.0000000  ")).toBe("100");
  });

  it("never converts through Number so very large amounts stay exact", () => {
    // 2^53 + 1 — well clear of Number.MAX_SAFE_INTEGER (2^53 - 1).
    const big = "9007199254740993.0000001";
    expect(formatAssetAmount(big)).toBe("9007199254740993.0000001");
  });

  it("truncates beyond Stellar's native seven-decimal precision by default", () => {
    expect(formatAssetAmount("0.12345678")).toBe("0.1234567");
    expect(formatAssetAmount("0.123456789")).toBe("0.1234567");
  });

  it("honors a custom maxDecimals option for assets with fewer decimals", () => {
    expect(formatAssetAmount("0.123456", { maxDecimals: 4 })).toBe("0.1234");
  });

  it("keeps trailing zeros when trimTrailingZeros is disabled", () => {
    expect(
      formatAssetAmount("100.0000000", { trimTrailingZeros: false })
    ).toBe("100.0000000");
    expect(
      formatAssetAmount("0.5000000", { trimTrailingZeros: false })
    ).toBe("0.5000000");
  });

  it("returns the raw input when empty or malformed (no exceptions)", () => {
    expect(formatAssetAmount("")).toBe("");
    expect(formatAssetAmount("   ")).toBe("   ");
    expect(formatAssetAmount("abc")).toBe("abc");
    expect(formatAssetAmount("1e10")).toBe("1e10");
    expect(formatAssetAmount("1,000")).toBe("1,000");
    expect(formatAssetAmount(".")).toBe(".");
    expect(formatAssetAmount("-")).toBe("-");
    expect(formatAssetAmount("+.5")).toBe("+.5");
  });

  it("does not crash on non-string inputs and returns them as-is", () => {
    // @ts-expect-error – runtime guard for unusual callers
    expect(formatAssetAmount(undefined)).toBe(undefined);
    // @ts-expect-error – runtime guard for unusual callers
    expect(formatAssetAmount(null)).toBe(null);
    // @ts-expect-error – runtime guard for unusual callers
    expect(formatAssetAmount(123)).toBe(123);
  });
});

describe("formatStroopsAsXLM", () => {
  it("converts integer stroop counts to trimmed XLM amounts", () => {
    expect(formatStroopsAsXLM("10000000")).toBe("1");
    expect(formatStroopsAsXLM("1")).toBe("0.0000001");
    expect(formatStroopsAsXLM("100")).toBe("0.00001");
    expect(formatStroopsAsXLM("1000000")).toBe("0.1");
    expect(formatStroopsAsXLM("10")).toBe("0.000001");
  });

  it("handles large stroop counts without losing precision", () => {
    expect(formatStroopsAsXLM("99999999999")).toBe("9999.9999999");
  });

  it("preserves numbers well over JavaScript's safe integer range", () => {
    // 2^53 + 1 stroops. If we accidentally round-tripped through Number(),
    // the value would collapse to 9007199254740992 (precision loss) and the
    // output would shift the last fractional digit. 9,007,199,254,740,993 /
    // 10^7 = 900,719,925.4740993 XLM.
    expect(formatStroopsAsXLM("9007199254740993")).toBe("900719925.4740993");
  });

  it("returns zero for a zero stroop count", () => {
    expect(formatStroopsAsXLM("0")).toBe("0");
  });

  it("trims surrounding whitespace before parsing", () => {
    expect(formatStroopsAsXLM("  10000000  ")).toBe("1");
  });

  it("keeps trailing zeros when trimTrailingZeros is disabled", () => {
    expect(formatStroopsAsXLM("10000000", { trimTrailingZeros: false })).toBe(
      "1.0000000"
    );
  });

  it("returns the raw input when empty or not a non-negative integer (no exceptions)", () => {
    expect(formatStroopsAsXLM("")).toBe("");
    expect(formatStroopsAsXLM("abc")).toBe("abc");
    expect(formatStroopsAsXLM("-1")).toBe("-1");
    expect(formatStroopsAsXLM("1.5")).toBe("1.5");
    expect(formatStroopsAsXLM("++1")).toBe("++1");
    expect(formatStroopsAsXLM(" 1 2 ")).toBe(" 1 2 ");
  });

  it("does not crash on non-string inputs and returns them as-is", () => {
    // @ts-expect-error – runtime guard for unusual callers
    expect(formatStroopsAsXLM(undefined)).toBe(undefined);
    // @ts-expect-error – runtime guard for unusual callers
    expect(formatStroopsAsXLM(123)).toBe(123);
  });
});
