import { classifyHorizonError } from "@/core/horizon/errors";
import type { TradeHistoryErrorCode } from "@/features/trade-history/types";

export function toTradeHistoryErrorCode(error: unknown): TradeHistoryErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "rate_limited" ? "rate_limited" : "request_failed";
}
