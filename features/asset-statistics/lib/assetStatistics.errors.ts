import { Horizon } from "@stellar/stellar-sdk";
import type { AssetStatisticsErrorCode } from "@/features/asset-statistics/types";

export function toAssetStatisticsErrorCode(error: unknown): AssetStatisticsErrorCode {
  if (error instanceof Horizon.ErrorResponse) {
    if (error.response?.status === 429) return "rate_limited";
  }
  return "request_failed";
}
