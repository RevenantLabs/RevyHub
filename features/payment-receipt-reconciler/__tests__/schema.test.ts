import { describe, expect, it } from "vitest";
import {
  isLikelyTransactionHash,
  parsePaymentReceiptReconcilerInput
} from "@/features/payment-receipt-reconciler/schema";
import { successfulHash } from "@/features/payment-receipt-reconciler/fixtures/paymentReceiptReconciler.fixture";

describe("parsePaymentReceiptReconcilerInput", () => {
  it("rejects empty input", () => {
    expect(parsePaymentReceiptReconcilerInput("")).toEqual({
      ok: false,
      code: "empty_input"
    });
    expect(parsePaymentReceiptReconcilerInput("   ")).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("rejects account addresses and short hex", () => {
    expect(parsePaymentReceiptReconcilerInput("GABC")).toEqual({
      ok: false,
      code: "invalid_hash"
    });
    expect(parsePaymentReceiptReconcilerInput("abc")).toEqual({
      ok: false,
      code: "invalid_hash"
    });
  });

  it("accepts a 64-character hash and lowercases it", () => {
    const upper = "A".repeat(64);
    expect(parsePaymentReceiptReconcilerInput(upper)).toEqual({
      ok: true,
      value: { hash: successfulHash }
    });
  });

  it("strips whitespace inside a pasted hash", () => {
    const spaced = `${"a".repeat(32)} ${"a".repeat(32)}`;
    expect(parsePaymentReceiptReconcilerInput(spaced)).toEqual({
      ok: true,
      value: { hash: successfulHash }
    });
  });
});

describe("isLikelyTransactionHash", () => {
  it("matches only 64 hex characters", () => {
    expect(isLikelyTransactionHash(successfulHash)).toBe(true);
    expect(isLikelyTransactionHash("not-a-hash")).toBe(false);
  });
});
