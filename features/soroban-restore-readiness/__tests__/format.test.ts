import { describe, expect, it } from "vitest";
import { formatLedger, formatLivenessLabel, formatRemainingLedgers } from "../lib/format";

describe("formatLedger", () => {
  it("adds thousands separators", () => {
    expect(formatLedger(1_000_000)).toBe("1,000,000");
  });
});

describe("formatLivenessLabel", () => {
  it("labels every liveness kind", () => {
    expect(formatLivenessLabel({ kind: "live", liveUntilLedgerSeq: 10 })).toBe("Live");
    expect(formatLivenessLabel({ kind: "pending_eviction", liveUntilLedgerSeq: 10 })).toBe("Expired, not yet evicted");
    expect(formatLivenessLabel({ kind: "archived" })).toBe("Archived");
    expect(formatLivenessLabel({ kind: "expired_temporary" })).toBe("Expired (temporary — not restorable)");
  });
});

describe("formatRemainingLedgers", () => {
  it("counts remaining ledgers while still live", () => {
    expect(formatRemainingLedgers(1_000_100, 1_000_000)).toBe("100 ledger(s) remaining");
  });

  it("counts ledgers past live-until once expired", () => {
    expect(formatRemainingLedgers(999_900, 1_000_000)).toBe("100 ledger(s) past live-until");
  });
});
