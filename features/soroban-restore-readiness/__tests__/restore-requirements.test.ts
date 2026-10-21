import { describe, expect, it } from "vitest";
import { describeRestoreRequirement } from "../lib/restore-requirements";

const contractId = "C".padEnd(56, "A");
const storageKeyXdr = "AAAAAA==";

describe("describeRestoreRequirement", () => {
  it("says an archived persistent entry is restorable and names the exact key", () => {
    const result = describeRestoreRequirement(contractId, storageKeyXdr, "persistent", { kind: "archived" });
    expect(result.restorable).toBe(true);
    expect(result.explanation).toContain("RestoreFootprint");
    expect(result.explanation).toContain(contractId);
  });

  it("says a pending-eviction persistent entry is restorable", () => {
    const result = describeRestoreRequirement(contractId, storageKeyXdr, "persistent", {
      kind: "pending_eviction",
      liveUntilLedgerSeq: 10
    });
    expect(result.restorable).toBe(true);
  });

  it("says a live entry is not restorable because restoring is not meaningful yet", () => {
    const result = describeRestoreRequirement(contractId, storageKeyXdr, "persistent", { kind: "live", liveUntilLedgerSeq: 10 });
    expect(result.restorable).toBe(false);
  });

  it("says an expired temporary entry is never restorable, regardless of the declared durability", () => {
    const result = describeRestoreRequirement(contractId, storageKeyXdr, "temporary", { kind: "expired_temporary" });
    expect(result.restorable).toBe(false);
    expect(result.explanation).toContain("deleted");
  });
});
