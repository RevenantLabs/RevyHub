import { describe, expect, it } from "vitest";
import { classifyLiveness } from "../lib/archival-classify";

const latestLedger = 1_000_000;

describe("classifyLiveness", () => {
  it("classifies a live persistent entry", () => {
    const result = classifyLiveness(
      { entries: [{ xdr: "x", liveUntilLedgerSeq: latestLedger + 10 }], latestLedger },
      "persistent"
    );
    expect(result).toEqual({ kind: "live", liveUntilLedgerSeq: latestLedger + 10 });
  });

  it("classifies a persistent entry past its live-until ledger as pending eviction", () => {
    const result = classifyLiveness(
      { entries: [{ xdr: "x", liveUntilLedgerSeq: latestLedger - 10 }], latestLedger },
      "persistent"
    );
    expect(result).toEqual({ kind: "pending_eviction", liveUntilLedgerSeq: latestLedger - 10 });
  });

  it("classifies a persistent row with no liveUntilLedgerSeq as archived", () => {
    const result = classifyLiveness({ entries: [{ xdr: "x" }], latestLedger }, "persistent");
    expect(result).toEqual({ kind: "archived" });
  });

  it("classifies an empty response for a temporary key as expired_temporary", () => {
    const result = classifyLiveness({ entries: [], latestLedger }, "temporary");
    expect(result).toEqual({ kind: "expired_temporary" });
  });

  it("classifies a temporary entry past its live-until ledger as expired_temporary, not pending eviction", () => {
    const result = classifyLiveness(
      { entries: [{ xdr: "x", liveUntilLedgerSeq: latestLedger - 10 }], latestLedger },
      "temporary"
    );
    expect(result).toEqual({ kind: "expired_temporary" });
  });

  it("classifies a live temporary entry as live, same as persistent", () => {
    const result = classifyLiveness(
      { entries: [{ xdr: "x", liveUntilLedgerSeq: latestLedger + 10 }], latestLedger },
      "temporary"
    );
    expect(result).toEqual({ kind: "live", liveUntilLedgerSeq: latestLedger + 10 });
  });

  it("treats a live-until ledger exactly equal to the latest ledger as still live", () => {
    const result = classifyLiveness(
      { entries: [{ xdr: "x", liveUntilLedgerSeq: latestLedger }], latestLedger },
      "persistent"
    );
    expect(result.kind).toBe("live");
  });
});
