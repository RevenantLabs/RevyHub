import { describe, expect, it } from "vitest";
import { detectSequenceGaps } from "@/features/ledger-close-cadence/lib/sequence-gaps";
import { validateAndSortLedgerSample } from "@/features/ledger-close-cadence/lib/ledger-sample";
import {
  gapsFixtureRecords,
  recentLedgersFixture
} from "@/features/ledger-close-cadence/fixtures/ledgerCloseCadence.fixture";

describe("detectSequenceGaps", () => {
  it("reports no gaps for a contiguous sample", () => {
    const sample = validateAndSortLedgerSample(recentLedgersFixture);
    expect(sample.ok).toBe(true);
    if (!sample.ok) return;
    expect(detectSequenceGaps(sample.value.ledgers)).toEqual([]);
  });

  it("counts missing sequences between fetched neighbors", () => {
    const sample = validateAndSortLedgerSample(gapsFixtureRecords);
    expect(sample.ok).toBe(true);
    if (!sample.ok) return;
    expect(detectSequenceGaps(sample.value.ledgers)).toEqual([
      {
        afterSequence: "2008",
        beforeSequence: "2010",
        missingCount: "1"
      }
    ]);
  });
});
