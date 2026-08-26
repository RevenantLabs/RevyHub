import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { AssetStatisticsErrorCode, AssetStatisticsInput } from "@/features/asset-statistics/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseAssetStatisticsInput(raw: string): Result<AssetStatisticsInput, AssetStatisticsErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  return ok({ value });
}
