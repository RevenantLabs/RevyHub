import { describe, expect, it } from "vitest";
import {
  filterToRequestedRange,
  normalizeFetchedLedgers,
  parseProtocolLedger
} from "@/features/ledger-protocol-transition-map/lib/ledger-pages";
import {
  malformedProtocolRecords,
  protocolLedgersFixture
} from "@/features/ledger-protocol-transition-map/fixtures/ledgerProtocolTransitionMap.fixture";

describe("parseProtocolLedger", () => {
  it("accepts sequence and protocol version", () => {
    expect(parseProtocolLedger(protocolLedgersFixture[0]!)).toMatchObject({
      sequence: "1000",
      protocolVersion: "20"
    });
  });

  it("rejects malformed records", () => {
    expect(parseProtocolLedger(malformedProtocolRecords[0]!)).toBeNull();
  });
});

describe("normalizeFetchedLedgers", () => {
  it("sorts and keeps valid ledgers", () => {
    const result = normalizeFetchedLedgers(protocolLedgersFixture);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.ledgers.map((ledger) => ledger.sequence)).toEqual([
      "1000",
      "1001",
      "1002",
      "1003"
    ]);
  });

  it("fails when every record is malformed", () => {
    expect(normalizeFetchedLedgers(malformedProtocolRecords)).toEqual({
      ok: false,
      code: "malformed_ledger"
    });
  });
});

describe("filterToRequestedRange", () => {
  it("keeps only ledgers inside the requested window", () => {
    const normalized = normalizeFetchedLedgers(protocolLedgersFixture);
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;
    expect(
      filterToRequestedRange(normalized.value.ledgers, 1001n, 2).map((ledger) => ledger.sequence)
    ).toEqual(["1001", "1002"]);
  });
});
