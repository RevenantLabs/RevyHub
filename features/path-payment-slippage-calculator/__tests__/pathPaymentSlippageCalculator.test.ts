import { describe, expect, it } from "vitest";
import { statusToPathPaymentError } from "@/features/path-payment-slippage-calculator/lib/pathPaymentSlippageCalculator.errors";
describe("path payment request outcomes", () => {
  it("maps not found distinctly", () => expect(statusToPathPaymentError(404)).toBe("transaction_not_found"));
  it("maps rate limits distinctly", () => expect(statusToPathPaymentError(429)).toBe("rate_limited"));
});
