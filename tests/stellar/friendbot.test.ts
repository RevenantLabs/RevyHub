/**
 * friendbot.ts — migrated to the shared MSW harness.
 *
 * Covers the full fetch() path through fundTestnetAccount without any live
 * network calls.
 */

import { describe, expect, it } from "vitest";
import { server } from "../msw/setup";
import { scenarioHandlers } from "../msw/handlers";
import { FIXTURE_ACCOUNT_ID, friendbotSuccessFixture } from "../msw/fixtures";
import { fundTestnetAccount } from "../../lib/stellar/friendbot";

describe("fundTestnetAccount", () => {
  it("returns the Friendbot success payload for a valid unfunded address", async () => {
    const result = await fundTestnetAccount(FIXTURE_ACCOUNT_ID);

    expect(result).toMatchObject({
      hash: friendbotSuccessFixture.hash,
      ledger: friendbotSuccessFixture.ledger
    });
  });

  it("throws when Friendbot returns an already-funded error", async () => {
    server.use(scenarioHandlers.friendbotAlreadyFunded);

    await expect(fundTestnetAccount(FIXTURE_ACCOUNT_ID)).rejects.toThrow(
      /already be funded or rate limited/
    );
  });

  it("throws when Friendbot returns a rate-limit response", async () => {
    server.use(scenarioHandlers.friendbotRateLimited);

    await expect(fundTestnetAccount(FIXTURE_ACCOUNT_ID)).rejects.toThrow(
      /already be funded or rate limited/
    );
  });

  it("rejects invalid public keys before making any network request", async () => {
    await expect(fundTestnetAccount("bad-key")).rejects.toThrow();
  });

  it("rejects secret keys before making any network request", async () => {
    await expect(
      fundTestnetAccount("SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    ).rejects.toThrow(/start with G/);
  });
});
