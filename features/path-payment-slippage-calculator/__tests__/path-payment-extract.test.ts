import { describe, expect, it } from "vitest";
import { extractPathPayment } from "@/features/path-payment-slippage-calculator/lib/path-payment-extract";
import { strictSendRecord } from "@/features/path-payment-slippage-calculator/fixtures/strict-send-payment.fixture";
describe("extractPathPayment", () => {
  it("extracts strict-send bounds and path", () => { const result = extractPathPayment([strictSendRecord]); expect(result.ok && result.value.variant).toBe("strict-send"); expect(result.ok && result.value.path).toHaveLength(1); });
  it("distinguishes a transaction with no path payment", () => expect(extractPathPayment([{ type: "payment" }])).toEqual({ ok: false, code: "no_path_payment_operation" }));
});
