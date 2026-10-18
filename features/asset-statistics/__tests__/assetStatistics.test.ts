import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import {
  loadAssetStatistics,
  parseAssetRecord
} from "@/features/asset-statistics/lib/assetStatistics";
import {
  handlers,
  rateLimitedHandler,
  serverErrorHandler
} from "@/features/asset-statistics/msw/handlers";
import {
  assetCode,
  assetRecord,
  issuerId,
  unknownAssetCode
} from "@/features/asset-statistics/fixtures/assetStatistics.fixture";

const server = withMswHandlers(...handlers);
const input = { assetCode, issuerId };

describe("parseAssetRecord", () => {
  it("calculates holders and every supply portion exactly", () => {
    const result = parseAssetRecord(assetRecord, input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.holders).toEqual({
      authorized: 12_345,
      liabilitiesOnly: 12,
      unauthorized: 8,
      total: 12_365
    });
    expect(result.value.accountBalances.total).toBe("9007199254741000.0000000");
    expect(result.value.claimableBalances.amount).toBe("100.0000001");
    expect(result.value.liquidityPools.amount).toBe("50.9999999");
    expect(result.value.contracts.amount).toBe("25.0000000");
    expect(result.value.circulatingSupply).toBe("9007199254741176.0000000");
  });

  it("maps all four issuer flags", () => {
    const result = parseAssetRecord(assetRecord, input);
    expect(result.ok && result.value.flags).toEqual({
      authRequired: true,
      authRevocable: false,
      authImmutable: false,
      authClawbackEnabled: true
    });
  });

  it("rejects a malformed Horizon amount", () => {
    expect(
      parseAssetRecord(
        { ...assetRecord, balances: { ...assetRecord.balances, authorized: "1.00000001" } },
        input
      )
    ).toEqual({ ok: false, code: "request_failed" });
  });

  it("defaults optional pool and contract fields to zero", () => {
    const { num_liquidity_pools, liquidity_pools_amount, num_contracts, contracts_amount, ...older } =
      assetRecord;
    void num_liquidity_pools;
    void liquidity_pools_amount;
    void num_contracts;
    void contracts_amount;

    const result = parseAssetRecord(older, input);
    expect(result.ok && result.value.liquidityPools.amount).toBe("0.0000000");
    expect(result.ok && result.value.contracts.count).toBe(0);
  });
});

describe("loadAssetStatistics", () => {
  it("loads the exact asset record", async () => {
    const result = await loadAssetStatistics(input, "testnet");
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.assetCode).toBe(assetCode);
  });

  it("returns asset_not_found for an empty record page", async () => {
    await expect(
      loadAssetStatistics({ assetCode: unknownAssetCode, issuerId }, "testnet")
    ).resolves.toEqual({ ok: false, code: "asset_not_found" });
  });

  it("maps a 429 to rate_limited", async () => {
    server.use(rateLimitedHandler);
    await expect(loadAssetStatistics(input, "testnet")).resolves.toEqual({
      ok: false,
      code: "rate_limited"
    });
  });

  it("maps a server failure to request_failed", async () => {
    server.use(serverErrorHandler);
    await expect(loadAssetStatistics(input, "testnet")).resolves.toEqual({
      ok: false,
      code: "request_failed"
    });
  });
});
