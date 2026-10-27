import { describe, expect, it } from "vitest";
import { extractPathPayment } from "@/features/path-payment-slippage-calculator/lib/path-payment-extract";
import { strictReceiveRecord } from "@/features/path-payment-slippage-calculator/fixtures/strict-receive-payment.fixture";
import { strictSendRecord } from "@/features/path-payment-slippage-calculator/fixtures/strict-send-payment.fixture";
describe("extractPathPayment", () => {
  it("extracts strict-send bounds and path", () => { const result = extractPathPayment([strictSendRecord]); expect(result.ok && result.value.variant).toBe("strict-send"); expect(result.ok && result.value.path).toHaveLength(1); });
  it("distinguishes a transaction with no path payment", () => expect(extractPathPayment([{ type: "payment" }])).toEqual({ ok: false, code: "no_path_payment_operation" }));
  it("reads Horizon destination_min and destination asset fields", () => {
    const result = extractPathPayment([strictSendRecord]);
    expect(result.ok && result.value.declaredBound).toBe("9.5000000");
    expect(result.ok && result.value.actualAmount).toBe("10.0000000");
    expect(result.ok && result.value.boundAsset).toEqual({
      type: "credit_alphanum4", code: "USDC", issuer: strictSendRecord.asset_issuer,
    });
  });
  it("reads Horizon source_max and the executed source amount", () => {
    const result = extractPathPayment([strictReceiveRecord]);
    expect(result.ok && result.value.variant).toBe("strict-receive");
    expect(result.ok && result.value.declaredBound).toBe("12.0000000");
    expect(result.ok && result.value.actualAmount).toBe("11.4000000");
    expect(result.ok && result.value.boundAsset).toEqual({ type: "native", code: "XLM", issuer: null });
  });

});
