import { Badge } from "@/components/ui/Badge";
import type { FeeStatsSummary } from "@/lib/stellar/feeStats";
import type { StroopAmount } from "@/lib/stellar/stroops";

function formatAmount(value: StroopAmount | null) {
  if (!value) {
    return "Not available";
  }

  return `${value.stroops} stroops (${value.xlm} XLM)`;
}

export function FeeStatsPanel({ stats }: { stats: FeeStatsSummary }) {
  const ledgerRows = [
    ["Last ledger", stats.lastLedger ?? "Not available"],
    ["Last ledger base fee", formatAmount(stats.lastLedgerBaseFee)],
    ["Ledger capacity usage", stats.ledgerCapacityUsage ?? "Not available"]
  ] as const;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#172033]">Latest ledger</p>
          <Badge tone="info">{stats.network}</Badge>
        </div>
        <dl className="divide-y divide-[#c7d6e8] rounded-lg border border-white/80 bg-white/68">
          {ledgerRows.map(([label, value]) => (
            <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
              <dt className="text-xs uppercase tracking-wide text-[#68758a]">{label}</dt>
              <dd className="break-words text-sm text-[#29364d] sm:col-span-2">{value}</dd>
            </div>
          ))}
        </dl>
        <ul className="space-y-1 text-xs leading-5 text-[#5d6b82]">
          <li>
            <span className="font-semibold text-[#29364d]">Last ledger base fee</span> is the minimum fee per
            operation that the network accepted into the most recently closed ledger.
          </li>
          <li>
            <span className="font-semibold text-[#29364d]">Ledger capacity usage</span> is how full that ledger
            was, from 0% (empty) to 100% (completely full). Fees tend to rise as usage climbs toward 100%.
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-[#172033]">Fees actually charged (recent ledgers)</p>
        <dl className="divide-y divide-[#c7d6e8] rounded-lg border border-white/80 bg-white/68">
          <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
            <dt className="text-xs uppercase tracking-wide text-[#68758a]">Minimum</dt>
            <dd className="break-words text-sm text-[#29364d] sm:col-span-2">{formatAmount(stats.chargedMin)}</dd>
          </div>
          <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
            <dt className="text-xs uppercase tracking-wide text-[#68758a]">Mode (most common)</dt>
            <dd className="break-words text-sm text-[#29364d] sm:col-span-2">{formatAmount(stats.chargedMode)}</dd>
          </div>
          {stats.chargedPercentiles.map((percentile) => (
            <div key={percentile.label} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
              <dt className="text-xs uppercase tracking-wide text-[#68758a]">{percentile.label}</dt>
              <dd className="break-words text-sm text-[#29364d] sm:col-span-2">
                {formatAmount(percentile.value)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-xs leading-5 text-[#5d6b82]">
          A percentile such as <span className="font-semibold text-[#29364d]">P90</span> means 90% of recently
          charged operations paid at or below that fee. Higher percentiles show what transactions paid during
          busier moments.
        </p>
      </div>
    </div>
  );
}
