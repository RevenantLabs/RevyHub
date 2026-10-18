import { classifyHorizonError } from "@/core/horizon/errors";
import type { LiquidityPoolInspectorErrorCode } from "@/features/liquidity-pool-inspector/types";

export function toLiquidityPoolInspectorErrorCode(error: unknown): LiquidityPoolInspectorErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "pool_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
