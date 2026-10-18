import { describe, expect, it } from "vitest";
import {
  linkOperationsToEffects,
  normalizeBalanceEffect,
  normalizePaymentOperation,
  operationIdFromEffectId
} from "@/features/payment-receipt-reconciler/lib/effect-links";
import {
  changeTrustOperation,
  creditEffect,
  debitEffect,
  paymentOpId,
  paymentOperation,
  trustlineEffect
} from "@/features/payment-receipt-reconciler/fixtures/paymentReceiptReconciler.fixture";
import {
  pathCreditEffect,
  pathDebitEffect,
  pathPaymentOperation,
  tradeEffect
} from "@/features/payment-receipt-reconciler/fixtures/mixed-effects.fixture";

describe("operationIdFromEffectId", () => {
  it("extracts the operation TOID", () => {
    expect(operationIdFromEffectId(`${paymentOpId}-1`)).toBe(paymentOpId);
    expect(operationIdFromEffectId("not-an-id")).toBeNull();
  });
});

describe("normalizePaymentOperation", () => {
  it("normalises a classic payment", () => {
    const op = normalizePaymentOperation(paymentOperation);
    expect(op?.type).toBe("payment");
    expect(op?.amount).toBe("12.5000000");
    expect(op?.asset).toEqual({ type: "native" });
  });

  it("normalises a path payment with source amount", () => {
    const op = normalizePaymentOperation(pathPaymentOperation);
    expect(op?.type).toBe("path_payment_strict_send");
    expect(op?.sourceAmount).toBe("10.0000000");
    expect(op?.sourceAsset).toEqual({ type: "native" });
  });

  it("rejects unsupported types", () => {
    expect(normalizePaymentOperation(changeTrustOperation)).toBeNull();
  });
});

describe("normalizeBalanceEffect", () => {
  it("keeps debit and credit effects", () => {
    expect(normalizeBalanceEffect(debitEffect)?.type).toBe("account_debited");
    expect(normalizeBalanceEffect(creditEffect)?.operationId).toBe(paymentOpId);
  });

  it("rejects trade effects", () => {
    expect(normalizeBalanceEffect(tradeEffect)).toBeNull();
  });
});

describe("linkOperationsToEffects", () => {
  it("links payment ops to debit and credit effects", () => {
    const result = linkOperationsToEffects([paymentOperation], [debitEffect, creditEffect]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.operations).toHaveLength(1);
    expect(result.value.links[0].debits).toHaveLength(1);
    expect(result.value.links[0].credits).toHaveLength(1);
    expect(result.value.outside).toEqual([]);
  });

  it("marks unrelated ops and effects as outside", () => {
    const result = linkOperationsToEffects(
      [pathPaymentOperation, changeTrustOperation],
      [pathDebitEffect, pathCreditEffect, tradeEffect, trustlineEffect]
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.outside).toEqual(
      expect.arrayContaining([
        { kind: "operation", id: changeTrustOperation.id, type: "change_trust" },
        { kind: "effect", id: tradeEffect.id, type: "trade" },
        { kind: "effect", id: trustlineEffect.id, type: "trustline_created" }
      ])
    );
  });

  it("returns unsupported_operation when no payment ops exist", () => {
    expect(linkOperationsToEffects([changeTrustOperation], [trustlineEffect])).toEqual({
      ok: false,
      code: "unsupported_operation"
    });
  });

  it("returns incomplete_effects when a credit is missing", () => {
    expect(linkOperationsToEffects([paymentOperation], [debitEffect])).toEqual({
      ok: false,
      code: "incomplete_effects"
    });
  });
});
