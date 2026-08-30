import { err, ok, type Result } from "@/core/result/result";
import type {
  LiquidityPoolInspectorErrorCode,
  LiquidityPoolInspectorInput
} from "@/features/liquidity-pool-inspector/types";

/** A liquidity pool ID is 32 bytes rendered as 64 hex characters. */
const POOL_ID = /^[a-fA-F0-9]{64}$/;

export function isLikelyPoolId(value: string): boolean {
  return POOL_ID.test(value);
}

export function parseLiquidityPoolInspectorInput(
  raw: string
): Result<LiquidityPoolInspectorInput, LiquidityPoolInspectorErrorCode> {
  const poolId = raw.replace(/\s+/g, "");

  if (!poolId) return err("empty_input");
  if (!POOL_ID.test(poolId)) return err("invalid_pool_id");

  return ok({ poolId: poolId.toLowerCase() });
}
