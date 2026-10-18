import { ok, type Result } from "@/core/result/result";
import type { FeeStatsErrorCode } from "@/features/fee-stats/types";

/**
 * This tool takes no user input — it reports on the selected network.
 *
 * The schema layer still exists so the slice keeps the same shape as every
 * other one, and so the "no input required" decision is stated in code rather
 * than implied by an absent file.
 */
export interface FeeStatsRequest {
  refreshedAt: number;
}

export function parseFeeStatsRequest(): Result<FeeStatsRequest, FeeStatsErrorCode> {
  return ok({ refreshedAt: Date.now() });
}
