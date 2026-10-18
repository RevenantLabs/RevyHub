import { describe, expect, it } from "vitest";
import { groupProtocolRuns } from "@/features/ledger-protocol-transition-map/lib/protocol-runs";
import { normalizeFetchedLedgers } from "@/features/ledger-protocol-transition-map/lib/ledger-pages";
import {
  missingLedgersFixtureRecords,
  protocolLedgersFixture
} from "@/features/ledger-protocol-transition-map/fixtures/ledgerProtocolTransitionMap.fixture";

describe("groupProtocolRuns", () => {
  it("groups contiguous same-version ledgers", () => {
    const sample = normalizeFetchedLedgers(protocolLedgersFixture);
    expect(sample.ok).toBe(true);
    if (!sample.ok) return;
    expect(groupProtocolRuns(sample.value.ledgers)).toEqual([
      {
        protocolVersion: "20",
        startSequence: "1000",
        endSequence: "1001",
        ledgerCount: "2"
      },
      {
        protocolVersion: "21",
        startSequence: "1002",
        endSequence: "1003",
        ledgerCount: "2"
      }
    ]);
  });

  it("starts a new run after a sequence gap even with the same version", () => {
    const sample = normalizeFetchedLedgers(missingLedgersFixtureRecords);
    expect(sample.ok).toBe(true);
    if (!sample.ok) return;
    expect(groupProtocolRuns(sample.value.ledgers)).toEqual([
      {
        protocolVersion: "19",
        startSequence: "2000",
        endSequence: "2000",
        ledgerCount: "1"
      },
      {
        protocolVersion: "20",
        startSequence: "2002",
        endSequence: "2003",
        ledgerCount: "2"
      }
    ]);
  });
});
