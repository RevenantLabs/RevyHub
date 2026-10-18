import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toStroopAmount } from "@/features/fee-stats/lib/stroops";
import { toFeeStatsErrorCode } from "@/features/fee-stats/lib/feeStats.errors";
import type {
  FeePercentile,
  FeeStatsErrorCode,
  FeeStatsSummary
} from "@/features/fee-stats/types";

const PERCENTILES = [
  "p10", "p20", "p30", "p40", "p50", "p60", "p70", "p80", "p90", "p95", "p99"
] as const;

type FeeBucket = Record<string, string | undefined>;

interface HorizonFeeStats {
  last_ledger?: string;
  last_ledger_base_fee?: string;
  ledger_capacity_usage?: string;
  fee_charged?: FeeBucket;
  max_fee?: FeeBucket;
}

/** Horizon reports capacity as a 0-1 fraction in a string. */
export function parseCapacityUsage(value: string | undefined): number | null {
  if (value === undefined) return null;
  const usage = Number(value);
  if (!Number.isFinite(usage) || usage < 0 || usage > 1) return null;
  return usage;
}

function percentilesOf(bucket: FeeBucket | undefined): FeePercentile[] {
  return PERCENTILES.map((field) => ({
    label: field.toUpperCase(),
    value: toStroopAmount(bucket?.[field])
  }));
}

export function normalizeFeeStats(stats: HorizonFeeStats): FeeStatsSummary {
  return {
    lastLedger: stats.last_ledger ?? null,
    lastLedgerBaseFee: toStroopAmount(stats.last_ledger_base_fee),
    capacityUsage: parseCapacityUsage(stats.ledger_capacity_usage),
    chargedMin: toStroopAmount(stats.fee_charged?.min),
    chargedMode: toStroopAmount(stats.fee_charged?.mode),
    chargedMax: toStroopAmount(stats.fee_charged?.max),
    chargedPercentiles: percentilesOf(stats.fee_charged),
    maxFeeMin: toStroopAmount(stats.max_fee?.min),
    maxFeeMode: toStroopAmount(stats.max_fee?.mode),
    maxFeePercentiles: percentilesOf(stats.max_fee),
    fetchedAt: new Date().toISOString()
  };
}

export async function getFeeStats(
  network: StellarNetwork
): Promise<Result<FeeStatsSummary, FeeStatsErrorCode>> {
  try {
    const stats = (await horizonServer(network).feeStats()) as unknown as HorizonFeeStats;

    // A response without a last ledger is not a fee-stats document.
    if (!stats || typeof stats !== "object" || stats.last_ledger === undefined) {
      return err("unexpected_response");
    }

    return ok(normalizeFeeStats(stats));
  } catch (error) {
    return err(toFeeStatsErrorCode(error));
  }
}
