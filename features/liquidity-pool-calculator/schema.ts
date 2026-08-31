import { err, ok, type Result } from "@/core/result/result";
import type {
  LiquidityPoolCalculatorErrorCode,
  LiquidityPoolCalculatorInput
} from "@/features/liquidity-pool-calculator/types";

export const POOL_ID = /^[a-fA-F0-9]{64}$/;
export const AMOUNT = /^(?:0|[1-9]\d*)(?:\.\d{1,7})?$/;

export function positiveAmount(value: unknown): value is string {
  return typeof value === "string" && AMOUNT.test(value) && !/^0+(?:\.0{1,7})?$/.test(value);
}

function readObject(raw: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

/** Parses the JSON request and rejects invalid values before a network call. */
export function parseLiquidityPoolCalculatorInput(
  raw: string
): Result<LiquidityPoolCalculatorInput, LiquidityPoolCalculatorErrorCode> {
  if (!raw.trim()) return err("empty_pool_id");
  const parsed = readObject(raw);
  if (!parsed) return err("invalid_pool_id");

  const poolId = typeof parsed.poolId === "string" ? parsed.poolId.replace(/\s+/g, "") : "";
  if (!poolId) return err("empty_pool_id");
  if (!POOL_ID.test(poolId)) return err("invalid_pool_id");

  const action = parsed.action;
  if (action !== "deposit" && action !== "withdraw") return err("invalid_amount");
  const slippageBps = parsed.slippageBps === undefined ? 0 : parsed.slippageBps;
  if (!Number.isInteger(slippageBps) || Number(slippageBps) < 0 || Number(slippageBps) > 10_000) return err("invalid_amount");

  if (action === "deposit") {
    if (!positiveAmount(parsed.amountA) || !positiveAmount(parsed.amountB)) return err("invalid_amount");
    return ok({ value: raw.trim(), poolId: poolId.toLowerCase(), action, amountA: parsed.amountA, amountB: parsed.amountB, slippageBps: Number(slippageBps) });
  }

  if (!positiveAmount(parsed.shares)) return err("invalid_amount");
  return ok({ value: raw.trim(), poolId: poolId.toLowerCase(), action, shares: parsed.shares, slippageBps: Number(slippageBps) });
}
