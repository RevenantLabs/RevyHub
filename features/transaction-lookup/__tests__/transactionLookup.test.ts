import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import {
  lookupTransaction,
  normalizeOperation,
  normalizeTransaction
} from "@/features/transaction-lookup/lib/transactionLookup";
import {
  handlers,
  operationsUnavailableHandler
} from "@/features/transaction-lookup/msw/handlers";
import {
  failedHash,
  missingHash,
  sourceAccount,
  successfulHash,
  successfulTransaction
} from "@/features/transaction-lookup/fixtures/transactionLookup.fixture";

const server = withMswHandlers(...handlers);

describe("normalizeTransaction", () => {
  it("stringifies numeric fee fields", () => {
    const result = normalizeTransaction(
      { ...successfulTransaction, fee_charged: 100, max_fee: 10000 } as never,
      []
    );

    expect(result.feeCharged).toBe("100");
    expect(result.maxFee).toBe("10000");
  });

  it("keeps the memo and its type together", () => {
    const result = normalizeTransaction(successfulTransaction as never, []);
    expect(result).toMatchObject({ memoType: "text", memo: "Invoice 1001" });
  });
});

describe("normalizeOperation", () => {
  it("maps Horizon field names onto the display type", () => {
    expect(
      normalizeOperation({ id: "1", type: "payment", source_account: sourceAccount })
    ).toEqual({ id: "1", type: "payment", sourceAccount });
  });
});

describe("lookupTransaction", () => {
  it("returns a successful transaction with its operations", async () => {
    resetHorizonClients();
    const result = await lookupTransaction({ hash: successfulHash }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.successful).toBe(true);
    expect(result.value.operations).toHaveLength(2);
    expect(result.value.operations[0].type).toBe("payment");
  });

  it("returns a failed transaction rather than an error", async () => {
    resetHorizonClients();
    const result = await lookupTransaction({ hash: failedHash }, "testnet");

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.successful).toBe(false);
  });

  it("still returns the transaction when the operations request fails", async () => {
    server.use(operationsUnavailableHandler);
    resetHorizonClients();
    const result = await lookupTransaction({ hash: successfulHash }, "testnet");

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.operations).toEqual([]);
  });

  it("maps a 404 to not_found", async () => {
    resetHorizonClients();
    const result = await lookupTransaction({ hash: missingHash }, "testnet");
    expect(result).toEqual({ ok: false, code: "not_found" });
  });
});
