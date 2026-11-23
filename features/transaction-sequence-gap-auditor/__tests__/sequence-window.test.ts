import { describe, expect, it } from "vitest";
import {
  compareSequence,
  normalizeSequenceWindow
} from "@/features/transaction-sequence-gap-auditor/lib/sequence-window";
import {
  accountId,
  largeSequenceRecords,
  transactionRecord
} from "@/features/transaction-sequence-gap-auditor/fixtures/normal.fixture";

describe("sequence window", () => {
  it("sorts large sequences with BigInt", () => {
    const result = normalizeSequenceWindow(largeSequenceRecords, accountId, 2);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sort(compareSequence).map((item) => item.sequence)).toEqual([
      "9223372036854775805",
      "9223372036854775806"
    ]);
    expect(result.value[0]?.pageIndex).toBe(2);
  });

  it("deduplicates paging tokens and keeps the first record", () => {
    const first = transactionRecord("10");
    const duplicate = transactionRecord("11", { paging_token: first.paging_token });
    const result = normalizeSequenceWindow([first, duplicate], accountId, 0);
    expect(result.ok && result.value).toHaveLength(1);
    expect(result.ok && result.value[0]?.sequence).toBe("10");
  });

  it("rejects oversized and malformed pages", () => {
    expect(
      normalizeSequenceWindow(
        Array.from({ length: 21 }, (_, index) => transactionRecord(String(index + 1))),
        accountId,
        0
      )
    ).toEqual({ ok: false, code: "too_large" });
    expect(normalizeSequenceWindow([{ hash: "bad" }], accountId, 0)).toEqual({
      ok: false,
      code: "malformed_data"
    });
  });
});
