import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { AssetStatisticsErrorCode, AssetStatisticsInput, AssetStatisticsResult } from "@/features/asset-statistics/types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runAssetStatistics(
  input: AssetStatisticsInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<AssetStatisticsResult, AssetStatisticsErrorCode>> {
  return ok({ summary: input.value });
}
