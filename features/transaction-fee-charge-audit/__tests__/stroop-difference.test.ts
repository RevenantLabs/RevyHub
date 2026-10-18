import { describe, expect, it } from "vitest";
import {
  computeStroopDifference,
  parseStroopAmount
} from "@/features/transaction-fee-charge-audit/lib/stroop-difference";

describe("parseStroopAmount", () => {
  it("accepts non-negative integer strings", () => {
    expect(parseStroopAmount("0")).toBe("0");
    expect(parseStroopAmount("10000")).toBe("10000");
  });

  it("accepts safe integer numbers", () => {
    expect(parseStroopAmount(100)).toBe("100");
  });

  it("rejects decimals, negatives and non-numeric values", () => {
    expect(parseStroopAmount("1.5")).toBeNull();
    expect(parseStroopAmount("-1")).toBeNull();
    expect(parseStroopAmount("abc")).toBeNull();
    expect(parseStroopAmount(Number.MAX_SAFE_INTEGER + 1)).toBeNull();
    expect(parseStroopAmount(null)).toBeNull();
  });
});

describe("computeStroopDifference", () => {
  it("returns the exact offered-minus-charged difference as BigInt strings", () => {
    expect(computeStroopDifference("10000", "200")).toEqual({
      ok: true,
      value: { maxFee: "10000", feeCharged: "200", difference: "9800" }
    });
  });

  it("handles values beyond Number.MAX_SAFE_INTEGER", () => {
    const maxFee = "9007199254740993";
    const charged = "1";
    const result = computeStroopDifference(maxFee, charged);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.difference).toBe("9007199254740992");
  });

  it("rejects missing or malformed fee fields", () => {
    expect(computeStroopDifference(undefined, "100")).toEqual({
      ok: false,
      code: "invalid_fee_data"
    });
    expect(computeStroopDifference("100", "x")).toEqual({
      ok: false,
      code: "invalid_fee_data"
    });
  });

  it("rejects a charged fee that exceeds the offered maximum", () => {
    expect(computeStroopDifference("100", "200")).toEqual({
      ok: false,
      code: "invalid_fee_data"
    });
  });
});
