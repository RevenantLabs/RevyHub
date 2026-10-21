import { describe, expect, it } from "vitest";
import { MAX_FEE_BPS, MIN_FEE_BPS, validateFeeBps } from "../lib/fee-bounds";

describe("validateFeeBps", () => {
  it("accepts the documented bounds", () => {
    expect(validateFeeBps(String(MIN_FEE_BPS)).ok).toBe(true);
    expect(validateFeeBps(String(MAX_FEE_BPS)).ok).toBe(true);
    expect(validateFeeBps("30").ok).toBe(true);
  });

  it("rejects a negative value", () => {
    const result = validateFeeBps("-1");
    expect(!result.ok && result.code).toBe("invalid_fee");
  });

  it("rejects a value above the maximum", () => {
    const result = validateFeeBps(String(MAX_FEE_BPS + 1));
    expect(!result.ok && result.code).toBe("invalid_fee");
  });

  it("rejects non-numeric input", () => {
    const result = validateFeeBps("abc");
    expect(!result.ok && result.code).toBe("invalid_fee");
  });
});
