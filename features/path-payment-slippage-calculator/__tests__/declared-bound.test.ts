import { describe, expect, it } from "vitest";
import { declaredBound } from "@/features/path-payment-slippage-calculator/lib/declared-bound";
import { extractPathPayment } from "@/features/path-payment-slippage-calculator/lib/path-payment-extract";
import { strictReceiveRecord } from "@/features/path-payment-slippage-calculator/fixtures/strict-receive-payment.fixture";
describe("declaredBound", () => {
  it("labels strict-receive as a maximum-send bound", () => { const record = extractPathPayment([strictReceiveRecord]); expect(record.ok && declaredBound(record.value)).toEqual({ ok: true, value: { direction: "maximum-send", amount: "12.0000000" } }); });
});
