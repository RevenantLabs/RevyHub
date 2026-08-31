import { classifyHorizonError } from "@/core/horizon/errors";
import type { OrderbookViewerErrorCode } from "@/features/orderbook-viewer/types";

export function toOrderbookViewerErrorCode(error: unknown): OrderbookViewerErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "rate_limited" ? "rate_limited" : "request_failed";
}
