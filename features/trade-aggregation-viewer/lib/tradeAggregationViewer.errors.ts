import { classifyHorizonError } from "@/core/horizon/errors";
import type { TradeAggregationViewerErrorCode } from "@/features/trade-aggregation-viewer/types";

export function toTradeAggregationViewerErrorCode(error: unknown): TradeAggregationViewerErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "rate_limited" ? "rate_limited" : "request_failed";
}
