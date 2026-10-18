import { describe, expect, it } from "vitest";
import { parseLiquidityPoolCalculatorInput } from "@/features/liquidity-pool-calculator/schema";

const poolId = "a".repeat(64);

describe("parseLiquidityPoolCalculatorInput", () => {
  it("distinguishes missing and malformed pool IDs", () => {
    expect(parseLiquidityPoolCalculatorInput("   ")).toEqual({ ok: false, code: "empty_pool_id" });
    expect(parseLiquidityPoolCalculatorInput(JSON.stringify({ action: "deposit" }))).toEqual({ ok: false, code: "empty_pool_id" });
    expect(parseLiquidityPoolCalculatorInput(JSON.stringify({ poolId: "nope", action: "deposit" }))).toEqual({ ok: false, code: "invalid_pool_id" });
  });

  it("validates operation amounts and normalises the pool ID", () => {
    const parsed = parseLiquidityPoolCalculatorInput(JSON.stringify({ poolId: poolId.toUpperCase(), action: "deposit", amountA: "1.0000000", amountB: "2" }));
    expect(parsed.ok && parsed.value.poolId).toBe(poolId);
    expect(parseLiquidityPoolCalculatorInput(JSON.stringify({ poolId, action: "deposit", amountA: "0", amountB: "1" }))).toEqual({ ok: false, code: "invalid_amount" });
    expect(parseLiquidityPoolCalculatorInput(JSON.stringify({ poolId, action: "withdraw", shares: "1.00000001" }))).toEqual({ ok: false, code: "invalid_amount" });
  });
});
