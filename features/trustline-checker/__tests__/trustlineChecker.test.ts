import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import {
  checkTrustline,
  findTrustline
} from "@/features/trustline-checker/lib/trustlineChecker";
import { handlers, wrongIssuerHandler } from "@/features/trustline-checker/msw/handlers";
import {
  accountId,
  creditBalances,
  issuerId,
  otherIssuerId,
  unknownAccountId,
  wrongIssuerBalances
} from "@/features/trustline-checker/fixtures/trustlineChecker.fixture";

const server = withMswHandlers(...handlers);

describe("findTrustline", () => {
  it("finds a matching code and issuer", () => {
    const result = findTrustline(creditBalances, "USDC", issuerId);

    expect(result.exists).toBe(true);
    if (!result.exists) return;
    expect(result.balance).toBe("25.0000000");
    expect(result.buyingLiabilities).toBe("0.0000000");
    expect(result.remainingReceivingCapacity).toBe("922337203660.4775807");
    expect(result.authorized).toBe(true);
  });

  it("subtracts buying liabilities with exact stroop arithmetic", () => {
    const result = findTrustline(
      [{
        asset_type: "credit_alphanum4",
        asset_code: "USDC",
        asset_issuer: issuerId,
        balance: "1.0000001",
        limit: "2.0000000",
        buying_liabilities: "0.2500002"
      }],
      "USDC",
      issuerId
    );

    expect(result).toMatchObject({
      buyingLiabilities: "0.2500002",
      remainingReceivingCapacity: "0.7499997"
    });
  });

  it("clamps capacity at zero when liabilities consume the limit", () => {
    const result = findTrustline(
      [{
        asset_type: "credit_alphanum4",
        asset_code: "USDC",
        asset_issuer: issuerId,
        balance: "2.0000000",
        limit: "2.0000000",
        buying_liabilities: "0.0000001"
      }],
      "USDC",
      issuerId
    );

    expect(result.exists && result.remainingReceivingCapacity).toBe("0.0000000");
  });

  it("matches the asset code case-insensitively", () => {
    expect(findTrustline(creditBalances, "usdc", issuerId).exists).toBe(true);
  });

  it("does not match a different issuer for the same code", () => {
    const result = findTrustline(creditBalances, "USDC", otherIssuerId);
    expect(result.exists).toBe(false);
  });

  it("lists the issuers actually trusted for that code", () => {
    const result = findTrustline(wrongIssuerBalances, "USDC", issuerId);

    expect(result.exists).toBe(false);
    if (result.exists) return;
    expect(result.otherIssuers).toEqual([otherIssuerId]);
  });

  it("reports an unauthorized trustline as existing but not authorized", () => {
    const result = findTrustline(creditBalances, "EURC", otherIssuerId);

    expect(result.exists).toBe(true);
    if (!result.exists) return;
    expect(result.authorized).toBe(false);
    expect(result.authorizedToMaintainLiabilities).toBe(true);
  });

  it("ignores native and liquidity pool balances", () => {
    const result = findTrustline(
      [
        { asset_type: "native", balance: "1" },
        { asset_type: "liquidity_pool_shares", balance: "1" }
      ],
      "XLM",
      issuerId
    );
    expect(result.exists).toBe(false);
  });
});

describe("checkTrustline", () => {
  it("returns a found trustline from Horizon", async () => {
    resetHorizonClients();
    const result = await checkTrustline(
      { accountId, assetCode: "USDC", issuerId },
      "testnet"
    );

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.exists).toBe(true);
  });

  it("returns a missing trustline with alternative issuers", async () => {
    server.use(wrongIssuerHandler);
    resetHorizonClients();
    const result = await checkTrustline(
      { accountId, assetCode: "USDC", issuerId },
      "testnet"
    );

    expect(result.ok && result.value.exists).toBe(false);
  });

  it("maps a 404 to account_not_found", async () => {
    resetHorizonClients();
    const result = await checkTrustline(
      { accountId: unknownAccountId, assetCode: "USDC", issuerId },
      "testnet"
    );

    expect(result).toEqual({ ok: false, code: "account_not_found" });
  });
});
