import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import {
  loadAccountBalances,
  normalizeBalance,
  sortBalances
} from "@/features/balance-viewer/lib/balanceViewer";
import {
  handlers,
  rateLimitedHandler,
  serverErrorHandler
} from "@/features/balance-viewer/msw/handlers";
import {
  accountId,
  accountResponse,
  issuerId,
  unknownAccountId
} from "@/features/balance-viewer/fixtures/balanceViewer.fixture";
import { resetHorizonClients } from "@/core/horizon/client";

const server = withMswHandlers(...handlers);

describe("normalizeBalance", () => {
  it("labels the native balance as XLM with no issuer", () => {
    const result = normalizeBalance(accountResponse.balances[0] as never);
    expect(result).toMatchObject({ kind: "native", assetCode: "XLM" });
    expect(result.issuer).toBeUndefined();
  });

  it("keeps the issuer and limit of a credit balance", () => {
    const result = normalizeBalance(accountResponse.balances[1] as never);
    expect(result).toMatchObject({ kind: "credit", assetCode: "USDC", issuer: issuerId });
  });

  it("uses the pool id as the issuer for pool shares", () => {
    const result = normalizeBalance(accountResponse.balances[2] as never);
    expect(result.kind).toBe("liquidity_pool");
    expect(result.issuer).toHaveLength(64);
  });
});

describe("sortBalances", () => {
  it("puts the native balance first and pool shares last", () => {
    const sorted = sortBalances([
      { kind: "liquidity_pool", assetCode: "Pool shares", balance: "1" },
      { kind: "credit", assetCode: "USDC", balance: "1" },
      { kind: "native", assetCode: "XLM", balance: "1" }
    ]);

    expect(sorted.map((balance) => balance.kind)).toEqual([
      "native",
      "credit",
      "liquidity_pool"
    ]);
  });

  it("orders credit assets alphabetically", () => {
    const sorted = sortBalances([
      { kind: "credit", assetCode: "USDC", balance: "1" },
      { kind: "credit", assetCode: "ARST", balance: "1" }
    ]);

    expect(sorted.map((balance) => balance.assetCode)).toEqual(["ARST", "USDC"]);
  });
});

describe("loadAccountBalances", () => {
  it("returns normalised, sorted balances for a funded account", async () => {
    resetHorizonClients();
    const result = await loadAccountBalances({ accountId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.balances).toHaveLength(3);
    expect(result.value.balances[0].assetCode).toBe("XLM");
    expect(result.value.subentryCount).toBe(3);
  });

  it("maps a 404 to account_not_found", async () => {
    resetHorizonClients();
    const result = await loadAccountBalances({ accountId: unknownAccountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "account_not_found" });
  });

  it("maps a 429 to rate_limited", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    const result = await loadAccountBalances({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "rate_limited" });
  });

  it("maps a 500 to request_failed", async () => {
    server.use(serverErrorHandler);
    resetHorizonClients();
    const result = await loadAccountBalances({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });
});
