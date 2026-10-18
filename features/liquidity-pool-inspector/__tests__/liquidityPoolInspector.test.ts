import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import {
  normalizeLiquidityPool,
  runLiquidityPoolInspector
} from "@/features/liquidity-pool-inspector/lib/liquidityPoolInspector";
import {
  handlers,
  membersPoolHandler,
  rateLimitedHandler
} from "@/features/liquidity-pool-inspector/msw/handlers";
import {
  horizonPoolResponse,
  horizonPoolWithMembers,
  missingPoolId,
  poolId
} from "@/features/liquidity-pool-inspector/fixtures/liquidityPoolInspector.fixture";

const server = withMswHandlers(...handlers);

describe("normalizeLiquidityPool", () => {
  it("labels native reserves as XLM through the normalised asset type", () => {
    const result = normalizeLiquidityPool(horizonPoolResponse);

    expect(result.reserves[0]).toMatchObject({ assetType: "native", amount: "10000.0000000" });
    expect(result.reserves[1].assetCode).toBe("USDC");
  });

  it("derives implied prices from the reserve ratio", () => {
    const result = normalizeLiquidityPool(horizonPoolResponse);

    expect(result.priceAToB).toBe("0.25");
    expect(result.priceBToA).toBe("4");
  });

  it("derives the value of one share in each reserve asset", () => {
    const result = normalizeLiquidityPool(horizonPoolResponse);

    expect(result.shareValueA).toBe("10");
    expect(result.shareValueB).toBe("2.5");
  });

  it("prefers num_pool_members over total_trustlines when both are present", () => {
    const result = normalizeLiquidityPool(horizonPoolWithMembers);

    expect(result.participantCount).toBe(17);
    expect(result.participantSource).toBe("num_pool_members");
  });

  it("falls back to total_trustlines when num_pool_members is absent", () => {
    const result = normalizeLiquidityPool(horizonPoolResponse);

    expect(result.participantCount).toBe(42);
    expect(result.participantSource).toBe("total_trustlines");
  });
});

describe("runLiquidityPoolInspector", () => {
  it("returns a normalised pool from Horizon", async () => {
    resetHorizonClients();
    const result = await runLiquidityPoolInspector({ poolId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.poolId).toBe(poolId);
    expect(result.value.feeBp).toBe(30);
  });

  it("maps a 404 to pool_not_found", async () => {
    resetHorizonClients();
    const result = await runLiquidityPoolInspector({ poolId: missingPoolId }, "testnet");

    expect(result).toEqual({ ok: false, code: "pool_not_found" });
  });

  it("maps a 429 to rate_limited", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    const result = await runLiquidityPoolInspector({ poolId }, "testnet");

    expect(result).toEqual({ ok: false, code: "rate_limited" });
  });

  it("reads num_pool_members when Horizon supplies it", async () => {
    server.use(membersPoolHandler);
    resetHorizonClients();
    const result = await runLiquidityPoolInspector({ poolId }, "testnet");

    expect(result.ok && result.value.participantSource).toBe("num_pool_members");
  });
});
