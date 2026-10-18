import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { runLiquidityPoolCalculator } from "@/features/liquidity-pool-calculator/lib/liquidityPoolCalculator";
import { emptyPoolId, missingPoolId, poolId } from "@/features/liquidity-pool-calculator/fixtures/liquidityPoolCalculator.fixture";
import { handlers } from "@/features/liquidity-pool-calculator/msw/handlers";

withMswHandlers(...handlers);

const deposit = (id = poolId, extra: Record<string, unknown> = {}) => ({ value: JSON.stringify({ poolId: id, action: "deposit", amountA: "100", amountB: "25", slippageBps: 50, ...extra }) });

describe("runLiquidityPoolCalculator", () => {
  it("fetches reserves and calculates proportional deposit shares", async () => {
    const result = await runLiquidityPoolCalculator(deposit(), "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.mintedShares).toBe("10");
    expect(result.value.consumedA).toBe("100");
    expect(result.value.consumedB).toBe("25");
    expect(result.value.currentPrice?.display).toBe("1/4");
    expect(result.value.priceLowerBound.display).toBe("199/800");
  });

  it("calculates a proportional withdrawal with fixed-point values", async () => {
    const result = await runLiquidityPoolCalculator({ value: JSON.stringify({ poolId, action: "withdraw", shares: "125" }) }, "testnet");
    expect(result.ok && result.value.withdrawnA).toBe("1250");
    expect(result.ok && result.value.withdrawnB).toBe("312.5");
  });

  it("handles an empty pool as a first deposit without dividing by zero", async () => {
    const result = await runLiquidityPoolCalculator(deposit(emptyPoolId, { amountA: "4", amountB: "9" }), "testnet");
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.firstDeposit).toBe(true);
    expect(result.ok && result.value.mintedShares).toBe("6");
    expect(result.ok && result.value.currentPrice).toBeNull();
  });

  it("returns specific errors for an excessive withdrawal and a missing pool", async () => {
    const insufficient = await runLiquidityPoolCalculator({ value: JSON.stringify({ poolId, action: "withdraw", shares: "1001" }) }, "testnet");
    expect(insufficient).toEqual({ ok: false, code: "insufficient_shares" });
    const missing = await runLiquidityPoolCalculator(deposit(missingPoolId), "testnet");
    expect(missing).toEqual({ ok: false, code: "pool_not_found" });
  });
});
