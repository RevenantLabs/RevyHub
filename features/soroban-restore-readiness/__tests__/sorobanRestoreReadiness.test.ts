import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { runSorobanRestoreReadiness } from "../lib/sorobanRestoreReadiness";
import { handlers } from "../msw/handlers";
import {
  liveContractId,
  notFoundContractId,
  pendingEvictionContractId,
  storageKeyXdr
} from "../fixtures/sorobanRestoreReadiness.fixture";
import { archivedContractId, archivedStorageKeyXdr } from "../fixtures/archived-persistent.fixture";
import { expiredTemporaryContractId, expiredTemporaryStorageKeyXdr } from "../fixtures/expired-temporary.fixture";

withMswHandlers(...handlers);

describe("runSorobanRestoreReadiness", () => {
  it("reports a live entry as restorable: false (not meaningful yet)", async () => {
    const result = await runSorobanRestoreReadiness(
      { contractId: liveContractId, storageKeyXdr, durability: "persistent" },
      "testnet"
    );
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.liveness.kind).toBe("live");
    expect(result.ok && result.value.restore.restorable).toBe(false);
  });

  it("reports a pending-eviction persistent entry as restorable", async () => {
    const result = await runSorobanRestoreReadiness(
      { contractId: pendingEvictionContractId, storageKeyXdr, durability: "persistent" },
      "testnet"
    );
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.liveness.kind).toBe("pending_eviction");
    expect(result.ok && result.value.restore.restorable).toBe(true);
  });

  it("reports an archived persistent entry as restorable and names the RestoreFootprint requirement", async () => {
    const result = await runSorobanRestoreReadiness(
      { contractId: archivedContractId, storageKeyXdr: archivedStorageKeyXdr, durability: "persistent" },
      "testnet"
    );
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.liveness.kind).toBe("archived");
    expect(result.ok && result.value.restore.restorable).toBe(true);
    expect(result.ok && result.value.restore.explanation).toContain("RestoreFootprint");
  });

  it("reports an expired temporary entry as a distinct, not-restorable outcome — not an error", async () => {
    const result = await runSorobanRestoreReadiness(
      { contractId: expiredTemporaryContractId, storageKeyXdr: expiredTemporaryStorageKeyXdr, durability: "temporary" },
      "testnet"
    );
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.liveness.kind).toBe("expired_temporary");
    expect(result.ok && result.value.restore.restorable).toBe(false);
  });

  it("returns entry_not_found when a persistent key has no live row and no archive marker", async () => {
    const result = await runSorobanRestoreReadiness(
      { contractId: notFoundContractId, storageKeyXdr, durability: "persistent" },
      "testnet"
    );
    expect(result.ok).toBe(false);
    expect(!result.ok && result.code).toBe("entry_not_found");
  });

  it("shows the current ledger used to make the determination", async () => {
    const result = await runSorobanRestoreReadiness(
      { contractId: liveContractId, storageKeyXdr, durability: "persistent" },
      "testnet"
    );
    expect(result.ok && result.value.latestLedger).toBeGreaterThan(0);
  });
});
