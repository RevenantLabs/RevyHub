import { classifyHorizonError } from "@/core/horizon/errors";
import type { AssetStatisticsErrorCode } from "@/features/asset-statistics/types";

/** Maps transport failures onto this tool's own error codes. */
export function toAssetStatisticsErrorCode(error: unknown): AssetStatisticsErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
