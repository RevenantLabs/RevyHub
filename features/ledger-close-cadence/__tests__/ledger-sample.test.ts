import { describe, expect, it } from "vitest";
import {
  parseLedgerRecord,
  validateAndSortLedgerSample
} from "@/features/ledger-close-cadence/lib/ledger-sample";
import {
  allMalformedRecords,
  malformedMixedRecords,
  recentLedgersFixture
} from "@/features/ledger-close-cadence/fixtures/ledgerCloseCadence.fixture";

describe("parseLedgerRecord", () => {
  it("accepts a Horizon ledger with sequence and UTC close time", () => {
    expect(parseLedgerRecord(recentLedgersFixture[0]!)).toMatchObject({
      sequence: "1004"
    });
  });

  it("rejects missing or invalid fields", () => {
    expect(parseLedgerRecord({ sequence: 1 })).toBeNull();
    expect(parseLedgerRecord({ closed_at: "2026-01-01T00:00:00Z" })).toBeNull();
    expect(parseLedgerRecord({ sequence: "x", closed_at: "2026-01-01T00:00:00Z" })).toBeNull();
    expect(parseLedgerRecord({ sequence: 1, closed_at: "not-a-date" })).toBeNull();
  });
});

describe("validateAndSortLedgerSample", () => {
  it("sorts descending Horizon pages into ascending sequence order", () => {
    const result = validateAndSortLedgerSample(recentLedgersFixture);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.ledgers.map((ledger) => ledger.sequence)).toEqual([
      "1001",
      "1002",
      "1003",
      "1004"
    ]);
    expect(result.value.malformedCount).toBe(0);
  });

  it("skips malformed records without discarding the rest", () => {
    const result = validateAndSortLedgerSample(malformedMixedRecords);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.ledgers.map((ledger) => ledger.sequence)).toEqual(["4000", "4002"]);
    expect(result.value.malformedCount).toBe(2);
  });

  it("fails when every record is malformed", () => {
    expect(validateAndSortLedgerSample(allMalformedRecords)).toEqual({
      ok: false,
      code: "malformed_ledger"
    });
  });

  it("fails on an empty page", () => {
    expect(validateAndSortLedgerSample([])).toEqual({
      ok: false,
      code: "history_unavailable"
    });
  });
});
