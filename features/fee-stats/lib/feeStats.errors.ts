import { classifyHorizonError } from "@/core/horizon/errors";
import type { FeeStatsErrorCode } from "@/features/fee-stats/types";

export function toFeeStatsErrorCode(error: unknown): FeeStatsErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "rate_limited") return "rate_limited";
  if (code === "network_unavailable" || code === "timeout") return "endpoint_unreachable";
  return "request_failed";
}
