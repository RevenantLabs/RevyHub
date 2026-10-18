import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { runPaymentReceiptReconciler } from "@/features/payment-receipt-reconciler/lib/paymentReceiptReconciler";
import {
  effectsUnavailableHandler,
  handlers
} from "@/features/payment-receipt-reconciler/msw/handlers";
import {
  failedHash,
  incompleteHash,
  missingHash,
  paymentOpId,
  successfulHash,
  unsupportedHash
} from "@/features/payment-receipt-reconciler/fixtures/paymentReceiptReconciler.fixture";
import { mixedEffectsHash } from "@/features/payment-receipt-reconciler/fixtures/mixed-effects.fixture";
import { errorCopy } from "@/features/payment-receipt-reconciler/copy";

const server = withMswHandlers(...handlers);

describe("runPaymentReceiptReconciler", () => {
  it("reconciles a successful payment with linked effects and totals", async () => {
    const result = await runPaymentReceiptReconciler({ hash: successfulHash }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.operations[0].id).toBe(paymentOpId);
    expect(result.value.links[0].debits).toHaveLength(1);
    expect(result.value.links[0].credits).toHaveLength(1);
    expect(result.value.totals.feeCharged).toBe("100");
    expect(result.value.publicReceipt).toEqual({
      hash: successfulHash,
      network: "testnet",
      ledger: 2_048_000
    });
  });

  it("keeps unrelated ops and effects visible on mixed transactions", async () => {
    const result = await runPaymentReceiptReconciler({ hash: mixedEffectsHash }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.operations[0].type).toBe("path_payment_strict_send");
    expect(result.value.outside.some((item) => item.type === "change_trust")).toBe(true);
    expect(result.value.outside.some((item) => item.type === "trade")).toBe(true);
  });

  it("rejects a failed transaction", async () => {
    const result = await runPaymentReceiptReconciler({ hash: failedHash }, "testnet");
    expect(result).toEqual({ ok: false, code: "transaction_failed" });
    expect(errorCopy.transaction_failed.title).toBeTruthy();
  });

  it("rejects a missing transaction", async () => {
    const result = await runPaymentReceiptReconciler({ hash: missingHash }, "testnet");
    expect(result).toEqual({ ok: false, code: "transaction_not_found" });
    expect(errorCopy.transaction_not_found.description).toMatch(/network/i);
  });

  it("rejects transactions without payment operations", async () => {
    const result = await runPaymentReceiptReconciler({ hash: unsupportedHash }, "testnet");
    expect(result).toEqual({ ok: false, code: "unsupported_operation" });
    expect(errorCopy.unsupported_operation.description).toMatch(/path-payment/i);
  });

  it("rejects payments with incomplete effects", async () => {
    const result = await runPaymentReceiptReconciler({ hash: incompleteHash }, "testnet");
    expect(result).toEqual({ ok: false, code: "incomplete_effects" });
    expect(errorCopy.incomplete_effects.title).toBeTruthy();
  });

  it("maps transport failures to request_failed", async () => {
    server.use(effectsUnavailableHandler);
    const result = await runPaymentReceiptReconciler({ hash: successfulHash }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
    expect(errorCopy.request_failed.description).toMatch(/connection/i);
  });
});
