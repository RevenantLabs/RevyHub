import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { server } from "../msw/setup";
import { simulateFriendbotError } from "../msw/test-utils";
import { fundTestnetAccount } from "../../lib/stellar/friendbot";

describe("fundTestnetAccount (MSW)", () => {
  it("returns a friendbot success response for a valid address", async () => {
    const publicKey = Keypair.random().publicKey();
    const result = await fundTestnetAccount(publicKey);

    expect(result).toHaveProperty("hash");
    expect(result.hash).toHaveLength(64);
    expect(result).toHaveProperty("latestLedger");
  });

  it("throws on an invalid public key", async () => {
    await expect(fundTestnetAccount("not-a-key")).rejects.toThrow(
      /start with G/
    );
  });

  it("throws on empty input", async () => {
    await expect(fundTestnetAccount("   ")).rejects.toThrow(
      /Enter a Stellar public address/
    );
  });

  it("throws on a secret key prefix", async () => {
    await expect(
      fundTestnetAccount("SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    ).rejects.toThrow(/start with G/);
  });

  it("handles server errors gracefully via per-test override", async () => {
    // Override the default friendbot handler to simulate a server error
    server.use(simulateFriendbotError());

    const publicKey = Keypair.random().publicKey();
    await expect(fundTestnetAccount(publicKey)).rejects.toThrow(
      /Friendbot could not fund/
    );
  });
});
