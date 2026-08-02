import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";

// Use the no-axios SDK variant so the Horizon HTTP client uses fetch,
// allowing MSW to intercept requests at the network level.
vi.mock("@stellar/stellar-sdk", async () => {
  return await import("@stellar/stellar-sdk/no-axios");
});

import { Keypair } from "@stellar/stellar-sdk";
import { server } from "../msw/setup";
import {
  simulateNotFound,
  simulateServerError,
  simulateMalformedJson
} from "../msw/test-utils";
import { createAccountFixture } from "../msw/fixtures";
import { getAccountBalances, getResponseStatus } from "../../lib/stellar/account";

const TESTNET_HORIZON = "https://horizon-testnet.stellar.org";

describe("getAccountBalances (MSW)", () => {
  it("normalizes native, credit, and pool balances from Horizon", async () => {
    const publicKey = Keypair.random().publicKey();
    const issuer = Keypair.random().publicKey();

    server.use(
      http.get(`${TESTNET_HORIZON}/accounts/:id`, ({ params }) => {
        return HttpResponse.json(
          createAccountFixture({
            account_id: params.id as string,
            id: params.id as string,
            balances: [
              {
                balance: "100.0000000",
                buying_liabilities: "0.0000000",
                selling_liabilities: "0.0000000",
                asset_type: "native"
              },
              {
                balance: "50.0000000",
                buying_liabilities: "0.0000000",
                selling_liabilities: "0.0000000",
                asset_type: "credit_alphanum4",
                asset_code: "USDC",
                asset_issuer: issuer
              },
              {
                balance: "10.0000000",
                buying_liabilities: "0.0000000",
                selling_liabilities: "0.0000000",
                asset_type: "liquidity_pool_shares",
                liquidity_pool_id:
                  "0000000000000000000000000000000000000000000000000000000000000000"
              }
            ]
          })
        );
      })
    );

    const balances = await getAccountBalances(publicKey, "testnet");

    expect(balances).toEqual([
      { assetCode: "XLM", amount: "100", isNative: true },
      {
        assetCode: "USDC",
        issuer,
        amount: "50"
      },
      {
        assetCode: "Liquidity pool shares",
        issuer: "0000000000000000000000000000000000000000000000000000000000000000",
        amount: "10"
      }
    ]);
  });

  it("selects the mainnet Horizon endpoint for the requested network", async () => {
    const publicKey = Keypair.random().publicKey();

    // The default mainnet handler returns the standard fixture; override it
    // with a distinctive balance so we can prove the mainnet URL was hit.
    server.use(
      http.get("https://horizon.stellar.org/accounts/:id", ({ params }) => {
        return HttpResponse.json(
          createAccountFixture({
            account_id: params.id as string,
            id: params.id as string,
            balances: [
              {
                balance: "777.0000000",
                buying_liabilities: "0.0000000",
                selling_liabilities: "0.0000000",
                asset_type: "native"
              }
            ]
          })
        );
      })
    );

    const balances = await getAccountBalances(publicKey, "mainnet");

    const native = balances.find((b) => b.assetCode === "XLM");
    expect(native).toBeDefined();
    expect(native!.amount).toBe("777");
  });

  it("throws a testnet-specific message when the account is not found", async () => {
    server.use(simulateNotFound());

    const publicKey = Keypair.random().publicKey();
    await expect(getAccountBalances(publicKey, "testnet")).rejects.toThrow(
      "Account not found on Stellar testnet. Fund it with Friendbot first."
    );
  });

  it("throws a mainnet-specific message when the account is not found", async () => {
    server.use(simulateNotFound());

    const publicKey = Keypair.random().publicKey();
    await expect(getAccountBalances(publicKey, "mainnet")).rejects.toThrow(
      "Account not found on Stellar mainnet."
    );
  });

  it("throws a generic message for other Horizon failures", async () => {
    server.use(simulateServerError());

    const publicKey = Keypair.random().publicKey();
    await expect(getAccountBalances(publicKey, "testnet")).rejects.toThrow(
      "Could not load account balances from Horizon. Try again in a moment."
    );
  });

  it("throws a generic message when Horizon responds with malformed JSON", async () => {
    server.use(simulateMalformedJson());

    const publicKey = Keypair.random().publicKey();
    await expect(getAccountBalances(publicKey, "testnet")).rejects.toThrow(
      "Could not load account balances from Horizon. Try again in a moment."
    );
  });

  it("rejects invalid public keys before calling Horizon", async () => {
    await expect(getAccountBalances("not-a-stellar-address", "testnet")).rejects.toThrow(
      /Stellar public addresses start with the letter G/
    );
  });
});

describe("getResponseStatus", () => {
  it("returns the HTTP status from Horizon-style errors", () => {
    expect(getResponseStatus({ response: { status: 404 } })).toBe(404);
  });

  it("returns undefined for non-response errors", () => {
    expect(getResponseStatus(new Error("timeout"))).toBeUndefined();
    expect(getResponseStatus(null)).toBeUndefined();
  });
});
