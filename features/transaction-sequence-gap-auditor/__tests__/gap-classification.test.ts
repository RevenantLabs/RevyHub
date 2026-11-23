import { describe, expect, it } from "vitest";
import { classifyGaps } from "@/features/transaction-sequence-gap-auditor/lib/gap-classification";
import { transactionRecord, accountId } from "@/features/transaction-sequence-gap-auditor/fixtures/normal.fixture";
import { normalizeSequenceWindow } from "@/features/transaction-sequence-gap-auditor/lib/sequence-window";

function evidence(sequences: string[], failed?: string) {
  const result = normalizeSequenceWindow(
    sequences.map((sequence) =>
      transactionRecord(sequence, { successful: sequence !== failed, source_account: accountId })
    ),
    accountId,
    0
  );
  if (!result.ok) throw new Error(result.code);
  return result.value;
}

describe("classifyGaps", () => {
  it("does not flag contiguous sequences, including failed transactions", () => {
    expect(classifyGaps(evidence(["10", "11", "12"], "11"), new Map())).toEqual([]);
  });

  it("proves a matching bump", () => {
    const records = evidence(["10", "50"]);
    expect(classifyGaps(records, new Map([[records[0]!.hash, "50"]]))[0]).toMatchObject({
      kind: "proved_bump",
      missingCount: "39",
      bumpTo: "50"
    });
  });

  it("separates unexplained and truncated boundary gaps", () => {
    expect(classifyGaps(evidence(["10", "20"]), new Map())[0]?.kind).toBe("unexplained");
    expect(classifyGaps(evidence(["10", "20"]), new Map(), true)[0]?.kind).toBe(
      "unexplained_truncated"
    );
  });
});
