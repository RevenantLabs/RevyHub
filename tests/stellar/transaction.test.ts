import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  HORIZON_REQUEST_TIMEOUT_MS,
  HorizonRequestCancelledError
} from "../../lib/stellar/horizon";
import {
  fetchTransactionOperations,
  isLikelyTransactionHash,
  lookupTransaction,
  normalizeOperation
} from "../../lib/stellar/transaction";

const VALID_HASH = "a".repeat(64);

const {
  transactionCallMock,
  operationsCallMock,
  operationsForTransactionMock,
  transactionMock,
  getHorizonServerMock
} = vi.hoisted(() => {
  const transactionCallMock = vi.fn();
  const transactionMock = vi.fn(() => ({ call: transactionCallMock }));
  const operationsCallMock = vi.fn();
  const operationsForTransactionMock = vi.fn(() => ({ call: operationsCallMock }));
  const getHorizonServerMock = vi.fn(() => ({
    transactions: () => ({ transaction: transactionMock }),
    operations: () => ({ forTransaction: operationsForTransactionMock })
  }));

  return {
    transactionCallMock,
    operationsCallMock,
    operationsForTransactionMock,
    transactionMock,
    getHorizonServerMock
  };
});

vi.mock("../../lib/stellar/horizon", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/stellar/horizon")>();

  return {
    ...actual,
    getHorizonServer: getHorizonServerMock
  };
});

function transactionRecord(overrides: Record<string, unknown> = {}) {
  return {
    hash: VALID_HASH,
    ledger_attr: 123456,
    source_account: "GA7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G",
    fee_charged: "200",
    created_at: "2024-01-01T00:00:00Z",
    successful: true,
    operation_count: 3,
    memo_type: "none",
    memo: null,
    ...overrides
  };
}

/* ------------------------------------------------------------------ */
/*  isLikelyTransactionHash                                            */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  normalizeOperation                                                 */
/* ------------------------------------------------------------------ */

describe("normalizeOperation", () => {
  it("normalises a payment operation", () => {
    const op = normalizeOperation({
      id: "123",
      type: "payment",
      source_account: "GAABC",
      created_at: "2024-01-01T00:00:00Z",
      transaction_hash: "deadbeef",
      from: "GAABC",
      to: "GBDEF",
      amount: "100.0000000",
      asset_type: "native"
    });

    expect(op.type).toBe("payment");
    expect(op.typeLabel).toBe("Payment");
    expect(op.from).toBe("GAABC");
    expect(op.to).toBe("GBDEF");
    expect(op.amount).toBe("100.0000000");
    expect(op.assetType).toBe("native");
  });

  it("normalises a create_account operation", () => {
    const op = normalizeOperation({
      id: "456",
      type: "create_account",
      source_account: "GAABC",
      created_at: "2024-01-01T00:00:00Z",
      transaction_hash: "deadbeef",
      funder: "GAABC",
      account: "GBDEF",
      starting_balance: "1000.0000000"
    });

    expect(op.type).toBe("create_account");
    expect(op.typeLabel).toBe("Create Account");
    expect(op.funder).toBe("GAABC");
    expect(op.account).toBe("GBDEF");
    expect(op.startingBalance).toBe("1000.0000000");
  });

  it("normalises a change_trust operation", () => {
    const op = normalizeOperation({
      id: "789",
      type: "change_trust",
      source_account: "GAABC",
      created_at: "2024-01-01T00:00:00Z",
      transaction_hash: "deadbeef",
      asset_code: "USDC",
      asset_issuer: "GBDEF",
      limit: "5000.0000000"
    });

    expect(op.type).toBe("change_trust");
    expect(op.typeLabel).toBe("Change Trust");
    expect(op.assetCode).toBe("USDC");
    expect(op.assetIssuer).toBe("GBDEF");
    expect(op.limit).toBe("5000.0000000");
  });

  it("normalises a manage_data operation", () => {
    const op = normalizeOperation({
      id: "101",
      type: "manage_data",
      source_account: "GAABC",
      created_at: "2024-01-01T00:00:00Z",
      transaction_hash: "deadbeef",
      data_name: "Hello",
      data_value: "d29ybGQ="
    });

    expect(op.type).toBe("manage_data");
    expect(op.typeLabel).toBe("Manage Data");
    expect(op.dataName).toBe("Hello");
    expect(op.dataValue).toBe("d29ybGQ=");
  });

  it("normalises an unknown operation type with a human-readable label", () => {
    const op = normalizeOperation({
      id: "202",
      type: "some_new_feature",
      source_account: "GAABC",
      created_at: "2024-01-01T00:00:00Z",
      transaction_hash: "deadbeef"
    });

    expect(op.type).toBe("some_new_feature");
    expect(op.typeLabel).toBe("Some New Feature");
  });

  it("handles empty type gracefully", () => {
    const op = normalizeOperation({
      id: "303",
      type: "",
      source_account: "GAABC",
      created_at: "2024-01-01T00:00:00Z",
      transaction_hash: "deadbeef"
    });

    expect(op.type).toBe("");
    expect(op.typeLabel).toBe("");
  });
});

/* ------------------------------------------------------------------ */
/*  lookupTransaction                                                  */
/* ------------------------------------------------------------------ */

describe("lookupTransaction", () => {
  beforeEach(() => {
    transactionCallMock.mockReset();
    operationsCallMock.mockReset();
    transactionMock.mockClear();
    operationsForTransactionMock.mockClear();
    getHorizonServerMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects an empty hash before calling Horizon", async () => {
    await expect(lookupTransaction("   ", "testnet")).rejects.toThrow(
      "Enter a transaction hash."
    );

    expect(getHorizonServerMock).not.toHaveBeenCalled();
  });

  it("rejects hashes that are not 64 hexadecimal characters", async () => {
    await expect(lookupTransaction("not-a-hash", "testnet")).rejects.toThrow(
      "Transaction hashes are 64 hexadecimal characters."
    );

    expect(getHorizonServerMock).not.toHaveBeenCalled();
  });

  it("rejects 64-character inputs that are not hexadecimal", async () => {
    await expect(lookupTransaction("z".repeat(64), "testnet")).rejects.toThrow(
      "Transaction hashes are 64 hexadecimal characters."
    );

    expect(getHorizonServerMock).not.toHaveBeenCalled();
  });

  it("normalizes a transaction record with a text memo and its operations", async () => {
    transactionCallMock.mockResolvedValue(
      transactionRecord({ memo_type: "text", memo: "Invoice 42" })
    );
    operationsCallMock.mockResolvedValue({
      records: [
        {
          id: "123",
          type: "payment",
          source_account: "GA7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G",
          created_at: "2024-01-01T00:00:00Z",
          transaction_hash: VALID_HASH,
          from: "GA7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G",
          to: "GB7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G",
          amount: "12.5000000",
          asset_type: "credit_alphanum4",
          asset_code: "USDC",
          asset_issuer: "GA7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G"
        }
      ]
    });

    const result = await lookupTransaction(`  ${VALID_HASH}  `, "testnet");

    expect(result.summary).toEqual({
      hash: VALID_HASH,
      ledger: 123456,
      sourceAccount: "GA7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G",
      feeCharged: "200",
      createdAt: "2024-01-01T00:00:00Z",
      successful: true,
      network: "testnet",
      operationCount: 3,
      memo: { type: "text", value: "Invoice 42" }
    });
    expect(result.operations).toEqual([
      {
        id: "123",
        type: "payment",
        typeLabel: "Payment",
        sourceAccount: "GA7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G",
        createdAt: "2024-01-01T00:00:00Z",
        transactionHash: VALID_HASH,
        from: "GA7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G",
        to: "GB7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G",
        amount: "12.5000000",
        assetType: "credit_alphanum4",
        assetCode: "USDC",
        assetIssuer: "GA7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G"
      }
    ]);
    expect(getHorizonServerMock).toHaveBeenCalledWith("testnet");
    expect(transactionMock).toHaveBeenCalledWith(VALID_HASH);
    expect(operationsForTransactionMock).toHaveBeenCalledWith(VALID_HASH);
  });

  it("maps the renamed ledger_attr field to the ledger number", async () => {
    // The SDK's TransactionRecord renames the raw `ledger` sequence field to
    // `ledger_attr` and repurposes `ledger` as a lazy fetch function, so the
    // sequence number must be read from ledger_attr (and not transaction.ledger).
    transactionCallMock.mockResolvedValue(transactionRecord({ ledger_attr: 987654 }));
    operationsCallMock.mockResolvedValue({ records: [] });

    const result = await lookupTransaction(VALID_HASH, "testnet");

    expect(result.summary.ledger).toBe(987654);
    expect(typeof result.summary.ledger).toBe("number");
  });

  it("omits the memo when the transaction has none", async () => {
    transactionCallMock.mockResolvedValue(transactionRecord({ memo_type: "none" }));
    operationsCallMock.mockResolvedValue({ records: [] });

    const result = await lookupTransaction(VALID_HASH, "mainnet");

    expect(result.summary.memo).toBeUndefined();
    expect(result.summary.network).toBe("mainnet");
    expect(result.operations).toEqual([]);
  });

  it("throws a testnet-specific message when the transaction is not found", async () => {
    transactionCallMock.mockRejectedValue({ response: { status: 404 } });

    await expect(lookupTransaction(VALID_HASH, "testnet")).rejects.toThrow(
      "Transaction not found on Stellar testnet."
    );

    expect(operationsForTransactionMock).not.toHaveBeenCalled();
  });

  it("throws a mainnet-specific message when the transaction is not found", async () => {
    transactionCallMock.mockRejectedValue({ response: { status: 404 } });

    await expect(lookupTransaction(VALID_HASH, "mainnet")).rejects.toThrow(
      "Transaction not found on Stellar mainnet."
    );
  });

  it("throws a generic message for other Horizon failures", async () => {
    transactionCallMock.mockRejectedValue(new Error("offline"));

    await expect(lookupTransaction(VALID_HASH, "testnet")).rejects.toThrow(
      "Could not load transaction from Horizon. Try again in a moment."
    );
  });

  it("reports a stable error when the Horizon request times out", async () => {
    vi.useFakeTimers();
    transactionCallMock.mockReturnValue(new Promise<string>(() => {}));

    const result = lookupTransaction(VALID_HASH, "testnet");
    const assertion = expect(result).rejects.toThrow(
      "The Horizon transaction request timed out. Try again."
    );

    await vi.advanceTimersByTimeAsync(HORIZON_REQUEST_TIMEOUT_MS);
    await assertion;
  });

  it("re-throws caller-initiated cancellations unchanged", async () => {
    transactionCallMock.mockReturnValue(new Promise<string>(() => {}));
    const controller = new AbortController();

    const result = lookupTransaction(VALID_HASH, "testnet", controller.signal);
    controller.abort();

    await expect(result).rejects.toBeInstanceOf(HorizonRequestCancelledError);
  });

  it("keeps the summary and reports null operations when the operation fetch fails", async () => {
    transactionCallMock.mockResolvedValue(transactionRecord());
    operationsCallMock.mockRejectedValue(new Error("offline"));

    const result = await lookupTransaction(VALID_HASH, "testnet");

    expect(result.summary.hash).toBe(VALID_HASH);
    expect(result.operations).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/*  fetchTransactionOperations                                         */
/* ------------------------------------------------------------------ */

describe("fetchTransactionOperations", () => {
  beforeEach(() => {
    operationsCallMock.mockReset();
    operationsForTransactionMock.mockClear();
    getHorizonServerMock.mockClear();
  });

  it("normalizes operation records for the requested network", async () => {
    operationsCallMock.mockResolvedValue({
      records: [
        {
          id: "123",
          type: "payment",
          source_account: "GA7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G",
          created_at: "2024-01-01T00:00:00Z",
          transaction_hash: VALID_HASH,
          from: "GA7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G",
          to: "GB7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G",
          amount: "12.5000000",
          asset_type: "credit_alphanum4",
          asset_code: "USDC",
          asset_issuer: "GA7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G"
        }
      ]
    });

    const operations = await fetchTransactionOperations(`  ${VALID_HASH}  `, "mainnet");

    expect(getHorizonServerMock).toHaveBeenCalledWith("mainnet");
    expect(operationsForTransactionMock).toHaveBeenCalledWith(VALID_HASH);
    expect(operations).toEqual([
      {
        id: "123",
        type: "payment",
        typeLabel: "Payment",
        sourceAccount: "GA7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G",
        createdAt: "2024-01-01T00:00:00Z",
        transactionHash: VALID_HASH,
        from: "GA7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G",
        to: "GB7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G",
        amount: "12.5000000",
        assetType: "credit_alphanum4",
        assetCode: "USDC",
        assetIssuer: "GA7Q3A3Z5X7O5KJ5J5QZ2Y7L5G3Q6W4H5L4K3J2I1H0G"
      }
    ]);
  });

  it("throws a stable message when Horizon fails", async () => {
    operationsCallMock.mockRejectedValue(new Error("offline"));

    await expect(fetchTransactionOperations(VALID_HASH, "testnet")).rejects.toThrow(
      "Could not load operations from Horizon. Try again in a moment."
    );
  });

  it("re-throws caller-initiated cancellations unchanged", async () => {
    operationsCallMock.mockReturnValue(new Promise<string>(() => {}));
    const controller = new AbortController();

    const result = fetchTransactionOperations(VALID_HASH, "testnet", controller.signal);
    controller.abort();

    await expect(result).rejects.toBeInstanceOf(HorizonRequestCancelledError);
  });
});
