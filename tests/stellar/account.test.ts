import { describe, expect, it, vi } from "vitest";

// Use the no-axios SDK variant so the Horizon HTTP client uses fetch,
// allowing MSW to intercept requests at the network level.
vi.mock("@stellar/stellar-sdk", async () => {
  return await import("@stellar/stellar-sdk/no-axios");
});

import { Keypair } from "@stellar/stellar-sdk";
import { server } from "../msw/setup";
import { simulateNotFound, simulateServerError } from "../msw/test-utils";
import { getAccountBalances } from "../../lib/stellar/account";

describe("getAccountBalances (MSW)", () => {
  it("returns balances for a valid account", async () => {
    const publicKey = Keypair.random().publicKey();
    const balances = await getAccountBalances(publicKey);

    expect(Array.isArray(balances)).toBe(true);
    expect(balances.length).toBeGreaterThanOrEqual(1);

    const native = balances.find((b) => b.assetCode === "XLM");
    expect(native).toBeDefined();
    expect(native!.amount).toBe("10000.0000000");
  });

  it("throws on an invalid public key", async () => {
    await expect(getAccountBalances("not-a-key")).rejects.toThrow(
      /start with G/
    );
  });

  it("throws on empty input", async () => {
    await expect(getAccountBalances("   ")).rejects.toThrow(
      /Enter a Stellar public address/
    );
  });

  it("handles 404 via per-test override (testnet)", async () => {
    server.use(simulateNotFound());

    const publicKey = Keypair.random().publicKey();
    await expect(getAccountBalances(publicKey, "testnet")).rejects.toThrow(
      /Account not found on Stellar testnet/
    );
  });

  it("handles 404 via per-test override (mainnet)", async () => {
    server.use(simulateNotFound());

    const publicKey = Keypair.random().publicKey();
    await expect(getAccountBalances(publicKey, "mainnet")).rejects.toThrow(
      /Account not found on Stellar mainnet/
    );
  });

  it("handles server error via per-test override", async () => {
    server.use(simulateServerError());

    const publicKey = Keypair.random().publicKey();
    await expect(getAccountBalances(publicKey)).rejects.toThrow(
      /Could not load account balances from Horizon/
    );
  });
});
