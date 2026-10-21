import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { fetchEntryState } from "../lib/entry-state-fetch";
import { handlers } from "../msw/handlers";
import {
  historyUnavailableContractId,
  liveContractId,
  liveRow,
  storageKeyXdr,
  unavailableContractId
} from "../fixtures/sorobanRestoreReadiness.fixture";

withMswHandlers(...handlers);

describe("fetchEntryState", () => {
  it("returns the matching row for a live entry", async () => {
    const result = await fetchEntryState(liveContractId, storageKeyXdr, "persistent", "testnet");
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.entries[0]).toEqual(liveRow);
  });

  it("maps a 429 response to rate_limited", async () => {
    const result = await fetchEntryState(unavailableContractId, storageKeyXdr, "persistent", "testnet");
    expect(!result.ok && result.code).toBe("rate_limited");
  });

  it("maps a history-unavailable RPC error to history_unavailable", async () => {
    const result = await fetchEntryState(historyUnavailableContractId, storageKeyXdr, "persistent", "testnet");
    expect(!result.ok && result.code).toBe("history_unavailable");
  });

  it("returns invalid_storage_key for XDR that does not decode as ScVal", async () => {
    const result = await fetchEntryState(liveContractId, "not-valid-base64", "persistent", "testnet");
    expect(!result.ok && result.code).toBe("invalid_storage_key");
  });
});
