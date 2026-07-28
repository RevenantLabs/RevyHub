/**
 * account.ts — migrated to the shared MSW harness.
 *
 * These tests exercise the full browser-request path through getHorizonServer
 * without calling any live Horizon endpoint.
 */

import { describe, expect, it } from "vitest";
import { server } from "../msw/setup";
import { scenarioHandlers } from "../msw/handlers";
import {
  FIXTURE_ACCOUNT_ID,
  FIXTURE_ISSUER_ID
} from "../msw/fixtures";
import { getAccountBalances } from "../../lib/stellar/account";

describe("getAccountBalances", () => {
  it("returns native and issued balances for a funded testnet account", async () => {
    const balances = await getAccountBalances(FIXTURE_ACCOUNT_ID, "testnet");

    expect(balances).toHaveLength(2);

    const xlm = balances.find((b) => b.assetCode === "XLM");
    expect(xlm).toBeDefined();
    expect(xlm?.amount).toBe("9999.9999600");

    const usdc = balances.find((b) => b.assetCode === "USDC");
    expect(usdc).toBeDefined();
    expect(usdc?.issuer).toBe(FIXTURE_ISSUER_ID);
    expect(usdc?.amount).toBe("10.0000000");
  });

  it("throws a testnet-specific message when the account is not found", async () => {
    server.use(scenarioHandlers.accountNotFound);

    await expect(
      getAccountBalances(FIXTURE_ACCOUNT_ID, "testnet")
    ).rejects.toThrow(/Fund it with Friendbot/);
  });

  it("throws a mainnet-specific message when the account is not found on mainnet", async () => {
    server.use(scenarioHandlers.accountNotFoundMainnet);

    await expect(
      getAccountBalances(FIXTURE_ACCOUNT_ID, "mainnet")
    ).rejects.toThrow(/not found on Stellar mainnet/);
  });

  it("throws a generic message for non-404 Horizon errors", async () => {
    server.use(scenarioHandlers.accountServerError);

    await expect(
      getAccountBalances(FIXTURE_ACCOUNT_ID, "testnet")
    ).rejects.toThrow(/Could not load account balances/);
  });

  it("rejects invalid public keys before making any network request", async () => {
    await expect(
      getAccountBalances("not-a-stellar-address", "testnet")
    ).rejects.toThrow();
  });
});
