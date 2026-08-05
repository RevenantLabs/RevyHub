import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isLikelyTransactionHash, lookupTransaction } from "../../lib/stellar/transaction";

const { transactionCallMock, getHorizonServerMock } = vi.hoisted(() => {
  const transactionCallMock = vi.fn();
  const getHorizonServerMock = vi.fn(() => ({
    transactions: () => ({
      transaction: () => ({
        call: transactionCallMock
      })
    })
  }));

  return { transactionCallMock, getHorizonServerMock };
});

vi.mock("../../lib/stellar/horizon", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/stellar/horizon")>();

  return {
    ...actual,
    getHorizonServer: getHorizonServerMock,
    STELLAR_NETWORK: "testnet"
  };
});

describe("isLikelyTransactionHash", () => {
  it("accepts 64-character hexadecimal hashes", () => {
    expect(isLikelyTransactionHash("a".repeat(64))).toBe(true);
    expect(isLikelyTransactionHash("ABCDEF0123456789".repeat(4))).toBe(true);
  });

  it("rejects hashes with invalid length or characters", () => {
    expect(isLikelyTransactionHash("a".repeat(63))).toBe(false);
    expect(isLikelyTransactionHash("z".repeat(64))).toBe(false);
  });
});

describe("lookupTransaction", () => {
  const hash = "a".repeat(64);

  const horizonRecord = {
    hash,
    ledger_attr: 12_345,
    source_account: "GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
    fee_charged: "100",
    created_at: "2024-01-01T00:00:00Z",
    successful: true,
    operation_count: 2,
    memo_type: "text",
    memo: "Hello world"
  };

  beforeEach(() => {
    transactionCallMock.mockReset();
    getHorizonServerMock.mockClear();
  });

  afterEach(() => {
    transactionCallMock.mockReset();
    getHorizonServerMock.mockReset();
  });

  it("normalizes a Horizon transaction into a TransactionSummary", async () => {
    transactionCallMock.mockResolvedValue(horizonRecord);

    const summary = await lookupTransaction(hash, "testnet");

    expect(summary).toEqual({
      hash,
      ledger: 12_345,
      sourceAccount: horizonRecord.source_account,
      feeCharged: "100",
      createdAt: "2024-01-01T00:00:00Z",
      successful: true,
      network: "testnet",
      operationCount: 2,
      memo: { type: "text", value: "Hello world" }
    });
  });

  it("maps a missing memo to undefined", async () => {
    transactionCallMock.mockResolvedValue({
      ...horizonRecord,
      memo_type: "none",
      memo: ""
    });

    const summary = await lookupTransaction(hash, "testnet");

    expect(summary.memo).toBeUndefined();
  });

  it("trims the hash and requests it from the selected network server", async () => {
    transactionCallMock.mockResolvedValue(horizonRecord);

    await lookupTransaction(`  ${hash}  `, "mainnet");

    expect(getHorizonServerMock).toHaveBeenCalledWith("mainnet");
    expect(transactionCallMock).toHaveBeenCalled();
  });

  it("throws a not-found message when Horizon returns 404", async () => {
    transactionCallMock.mockRejectedValue({ response: { status: 404 } });

    await expect(lookupTransaction(hash, "testnet")).rejects.toThrow(
      "Transaction not found on Stellar testnet."
    );
  });

  it("throws a generic message for other Horizon failures", async () => {
    transactionCallMock.mockRejectedValue({ response: { status: 503 } });

    await expect(lookupTransaction(hash, "testnet")).rejects.toThrow(
      "Could not load transaction from Horizon. Try again in a moment."
    );
  });

  it("validates the hash before calling Horizon", async () => {
    await expect(lookupTransaction("", "testnet")).rejects.toThrow(
      "Enter a transaction hash."
    );
    await expect(lookupTransaction("not-a-hash", "testnet")).rejects.toThrow(
      "Transaction hashes are 64 hexadecimal characters."
    );

    expect(getHorizonServerMock).not.toHaveBeenCalled();
  });
});
