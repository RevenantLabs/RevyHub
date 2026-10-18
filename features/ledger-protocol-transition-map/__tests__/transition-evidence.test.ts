import { describe, expect, it } from "vitest";
import {
  classifyTransitions,
  detectSequenceGaps
} from "@/features/ledger-protocol-transition-map/lib/transition-evidence";
import { normalizeFetchedLedgers } from "@/features/ledger-protocol-transition-map/lib/ledger-pages";
import {
  missingLedgersFixtureRecords,
  protocolLedgersFixture
} from "@/features/ledger-protocol-transition-map/fixtures/ledgerProtocolTransitionMap.fixture";

describe("detectSequenceGaps", () => {
  it("finds missing sequences", () => {
    const sample = normalizeFetchedLedgers(missingLedgersFixtureRecords);
    expect(sample.ok).toBe(true);
    if (!sample.ok) return;
    expect(detectSequenceGaps(sample.value.ledgers)).toEqual([
      { afterSequence: "2000", beforeSequence: "2002", missingCount: "1" }
    ]);
  });
});

describe("classifyTransitions", () => {
  it("marks adjacent version changes as exact", () => {
    const sample = normalizeFetchedLedgers(protocolLedgersFixture);
    expect(sample.ok).toBe(true);
    if (!sample.ok) return;
    expect(classifyTransitions(sample.value.ledgers)).toEqual([
      {
        fromVersion: "20",
        toVersion: "21",
        beforeSequence: "1001",
        afterSequence: "1002",
        certainty: "exact",
        reason: "adjacent"
      }
    ]);
  });

  it("marks version changes across gaps as uncertain", () => {
    const sample = normalizeFetchedLedgers(missingLedgersFixtureRecords);
    expect(sample.ok).toBe(true);
    if (!sample.ok) return;
    expect(classifyTransitions(sample.value.ledgers)).toEqual([
      {
        fromVersion: "19",
        toVersion: "20",
        beforeSequence: "2000",
        afterSequence: "2002",
        certainty: "uncertain",
        reason: "sequence_gap"
      }
    ]);
  });
});
