import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHorizonServer } from "../../lib/stellar/horizon";
import {
  isLikelyTransactionHash,
  lookupTransaction,
  normalizeTransactionMemo
} from "../../lib/stellar/transaction";

vi.mock("../../lib/stellar/horizon", () => ({
  STELLAR_NETWORK: "testnet",
  getHorizonServer: vi.fn()
}));

const hash = "a".repeat(64);

const baseHorizonTransaction = {
  hash,
  ledger_attr: 123456,
  source_account: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
  fee_charged: "100",
  created_at: "2024-01-01T00:00:00Z",
  successful: true,
  operation_count: 1
};

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

describe("normalizeTransactionMemo", () => {
  it("maps none memos to a null value", () => {
    expect(normalizeTransactionMemo("none", "")).toEqual({ type: "none", value: null });
    expect(normalizeTransactionMemo("none", undefined)).toEqual({ type: "none", value: null });
  });

  it("maps text memos to trimmed text values", () => {
    expect(normalizeTransactionMemo("text", " Invoice 1001 ")).toEqual({
      type: "text",
      value: "Invoice 1001"
    });
  });

  it("maps id memos to string identifiers", () => {
    expect(normalizeTransactionMemo("id", "424242")).toEqual({
      type: "id",
      value: "424242"
    });
  });

  it("maps hash memos to hex values", () => {
    const memoHash = "b".repeat(64);

    expect(normalizeTransactionMemo("hash", memoHash)).toEqual({
      type: "hash",
      value: memoHash
    });
  });

  it("maps return memos to return-hash values", () => {
    const returnHash = "c".repeat(64);

    expect(normalizeTransactionMemo("return", returnHash)).toEqual({
      type: "return",
      value: returnHash
    });
  });

  it("falls back to none for unknown memo types", () => {
    expect(normalizeTransactionMemo("unexpected", "value")).toEqual({
      type: "none",
      value: null
    });
  });
});

describe("lookupTransaction", () => {
  beforeEach(() => {
    vi.mocked(getHorizonServer).mockReturnValue({
      transactions: () => ({
        transaction: () => ({
          call: vi.fn()
        })
      })
    } as never);
  });

  it("includes memo type and value in the normalized summary", async () => {
    const call = vi.fn().mockResolvedValue({
      ...baseHorizonTransaction,
      memo_type: "text",
      memo: "Invoice 1001"
    });

    vi.mocked(getHorizonServer).mockReturnValue({
      transactions: () => ({
        transaction: () => ({ call })
      })
    } as never);

    const summary = await lookupTransaction(hash, "testnet");

    expect(call).toHaveBeenCalledWith();
    expect(summary.memo).toEqual({ type: "text", value: "Invoice 1001" });
  });

  it("normalizes every supported memo type from Horizon", async () => {
    const memoCases = [
      { memo_type: "none", memo: "", expected: { type: "none", value: null } },
      { memo_type: "text", memo: "Payment note", expected: { type: "text", value: "Payment note" } },
      { memo_type: "id", memo: "9001", expected: { type: "id", value: "9001" } },
      {
        memo_type: "hash",
        memo: "d".repeat(64),
        expected: { type: "hash", value: "d".repeat(64) }
      },
      {
        memo_type: "return",
        memo: "e".repeat(64),
        expected: { type: "return", value: "e".repeat(64) }
      }
    ] as const;

    for (const memoCase of memoCases) {
      const call = vi.fn().mockResolvedValue({
        ...baseHorizonTransaction,
        memo_type: memoCase.memo_type,
        memo: memoCase.memo
      });

      vi.mocked(getHorizonServer).mockReturnValue({
        transactions: () => ({
          transaction: () => ({ call })
        })
      } as never);

      const summary = await lookupTransaction(hash, "testnet");
      expect(summary.memo).toEqual(memoCase.expected);
    }
  });
});
