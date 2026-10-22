import { describe, expect, it } from "vitest";
import { parsePathPaymentSlippageCalculatorInput } from "@/features/path-payment-slippage-calculator/schema";
describe("parsePathPaymentSlippageCalculatorInput", () => {
  it("accepts and normalizes a transaction hash", () => expect(parsePathPaymentSlippageCalculatorInput("  " + "AB".repeat(32) + " ")).toEqual({ ok: true, value: { hash: "ab".repeat(32) } }));
  it("rejects malformed hashes", () => expect(parsePathPaymentSlippageCalculatorInput("123")).toEqual({ ok: false, code: "invalid_hash" }));
});
