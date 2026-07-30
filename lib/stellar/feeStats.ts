import { getHorizonServer, STELLAR_NETWORK, type StellarNetwork } from "@/lib/stellar/horizon";
import { formatStroopAmount, type StroopAmount } from "@/lib/stellar/stroops";

const PERCENTILE_FIELDS = ["p10", "p20", "p30", "p40", "p50", "p60", "p70", "p80", "p90", "p95", "p99"] as const;

export interface FeeStatsPercentile {
  label: string;
  value: StroopAmount | null;
}

export interface FeeStatsSummary {
  network: StellarNetwork;
  lastLedger: string | null;
  lastLedgerBaseFee: StroopAmount | null;
  ledgerCapacityUsage: string | null;
  chargedMin: StroopAmount | null;
  chargedMode: StroopAmount | null;
  chargedPercentiles: FeeStatsPercentile[];
  fetchedAt: string;
}

export function formatCapacityUsage(value: string | undefined): string | null {
  const usage = Number(value);

  if (!Number.isFinite(usage) || usage < 0 || usage > 1) {
    return null;
  }

  return `${(usage * 100).toFixed(1)}%`;
}

export async function getFeeStats(network: StellarNetwork = STELLAR_NETWORK): Promise<FeeStatsSummary> {
  try {
    const stats = await getHorizonServer(network).feeStats();

    return {
      network,
      lastLedger: stats.last_ledger ?? null,
      lastLedgerBaseFee: formatStroopAmount(stats.last_ledger_base_fee),
      ledgerCapacityUsage: formatCapacityUsage(stats.ledger_capacity_usage),
      chargedMin: formatStroopAmount(stats.fee_charged?.min),
      chargedMode: formatStroopAmount(stats.fee_charged?.mode),
      chargedPercentiles: PERCENTILE_FIELDS.map((field) => ({
        label: field.toUpperCase(),
        value: formatStroopAmount(stats.fee_charged?.[field])
      })),
      fetchedAt: new Date().toISOString()
    };
  } catch {
    throw new Error(`Could not load fee statistics from Stellar ${network} Horizon. Try again in a moment.`);
  }
}
