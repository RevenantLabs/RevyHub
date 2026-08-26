import { describe, expect, it } from "vitest";
import { checkAccountMergePreflight } from "@/features/account-merge-preflight/lib/account-merge-preflight";
import { sourceId, destinationId, source2Id, sponsorId } from "@/features/account-merge-preflight/fixtures/account-merge-preflight.fixture";
import { resetHorizonClients } from "@/core/horizon/client";
import { Keypair } from "@stellar/stellar-sdk";
import { withMswHandlers } from "@/core/testing/msw";
import { handlers } from "@/features/account-merge-preflight/msw/handlers";

withMswHandlers(...handlers);

const NETWORK = "testnet";

describe("checkAccountMergePreflight", () => {
  it("rejects same account", async () => {
    const result = await checkAccountMergePreflight({ source: sourceId, destination: sourceId }, NETWORK);
    expect(result).toEqual({ ok: false, code: "same_account" });
  });

  it("returns destination_not_found if destination is missing", async () => {
    resetHorizonClients();
    const result = await checkAccountMergePreflight({ source: sourceId, destination: Keypair.random().publicKey() }, NETWORK);
    expect(result).toEqual({ ok: false, code: "destination_not_found" });
  });

  it("returns source_not_found if source is missing", async () => {
    resetHorizonClients();
    const result = await checkAccountMergePreflight({ source: Keypair.random().publicKey(), destination: destinationId }, NETWORK);
    expect(result).toEqual({ ok: false, code: "source_not_found" });
  });

  it("returns mergeable result when source has no subentries", async () => {
    resetHorizonClients();
    const result = await checkAccountMergePreflight({ source: sourceId, destination: destinationId }, NETWORK);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.isMergeable).toBe(true);
    expect(result.value.transferableXlm).toBe("100.0000000");
    expect(result.value.blockingItems).toHaveLength(0);
  });

  it("returns not mergeable with all blocking items", async () => {
    resetHorizonClients();
    const result = await checkAccountMergePreflight({ source: source2Id, destination: destinationId }, NETWORK);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.isMergeable).toBe(false);
    expect(result.value.blockingItems).toEqual(expect.arrayContaining([
      { type: "trustline", description: "USDC" },
      { type: "data_entry", description: "test_data" },
      { type: "signer", description: sponsorId },
      { type: "sponsorship", description: "1 sponsored" },
      { type: "sponsorship", description: `Sponsored by ${sponsorId}` },
      { type: "offer", description: "123" }
    ]));
  });
});
