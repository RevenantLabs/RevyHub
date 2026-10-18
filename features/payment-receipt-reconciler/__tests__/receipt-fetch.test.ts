import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import {
  fetchReceiptBundle,
  parseReceiptAsset
} from "@/features/payment-receipt-reconciler/lib/receipt-fetch";
import {
  effectsUnavailableHandler,
  handlers
} from "@/features/payment-receipt-reconciler/msw/handlers";
import {
  missingHash,
  paymentOpId,
  sourceAccount,
  successfulHash
} from "@/features/payment-receipt-reconciler/fixtures/paymentReceiptReconciler.fixture";
import { issuerAccount } from "@/features/payment-receipt-reconciler/fixtures/paymentReceiptReconciler.fixture";

const server = withMswHandlers(...handlers);

describe("parseReceiptAsset", () => {
  it("maps native and credit assets", () => {
    expect(parseReceiptAsset("native")).toEqual({ type: "native" });
    expect(parseReceiptAsset("credit_alphanum4", "USDC", issuerAccount)).toEqual({
      type: "credit",
      code: "USDC",
      issuer: issuerAccount
    });
    expect(parseReceiptAsset("credit_alphanum4", "USDC")).toBeNull();
  });
});

describe("fetchReceiptBundle", () => {
  it("returns transaction, operations and effects together", async () => {
    const result = await fetchReceiptBundle(successfulHash, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.transaction.hash).toBe(successfulHash);
    expect(result.value.operations[0].id).toBe(paymentOpId);
    expect(result.value.effects).toHaveLength(2);
    expect(result.value.transaction.source_account).toBe(sourceAccount);
  });

  it("maps a missing transaction to transaction_not_found", async () => {
    const result = await fetchReceiptBundle(missingHash, "testnet");
    expect(result).toEqual({ ok: false, code: "transaction_not_found" });
  });

  it("maps a failed effects request to request_failed", async () => {
    server.use(effectsUnavailableHandler);
    const result = await fetchReceiptBundle(successfulHash, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });
});
