import { classifyHorizonError } from "@/core/horizon/errors";
import type { LiquidityPoolCalculatorErrorCode } from "@/features/liquidity-pool-calculator/types";

export function toLiquidityPoolCalculatorErrorCode(error: unknown): LiquidityPoolCalculatorErrorCode {
  const { code } = classifyHorizonError(error);
  if (code === "not_found") return "pool_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
