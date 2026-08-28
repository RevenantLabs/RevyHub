import { Card, CardHeader, CardTitle, CardDescription } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, congestionCopy } from "@/features/fee-stats/copy";
import {
  congestionOf,
  formatCapacityUsage,
  formatFee,
  recommendFee
} from "@/features/fee-stats/lib/format";
import type { FeePercentile, FeeStatsSummary } from "@/features/fee-stats/types";

function PercentileTable({
  title,
  description,
  percentiles,
  caption
}: {
  title: string;
  description: string;
  percentiles: FeePercentile[];
  caption: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-[#e3ebf5]">
              <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">Percentile</th>
              <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">Stroops</th>
              <th scope="col" className="py-2 font-bold text-[#4e5c73]">XLM</th>
            </tr>
          </thead>
          <tbody>
            {percentiles.map((percentile) => (
              <tr key={percentile.label} className="border-b border-[#f0f4f9] last:border-0">
                <th scope="row" className="py-2 pr-4 font-semibold text-[#172033]">
                  {percentile.label}
                </th>
                <td className="py-2 pr-4 font-mono text-[#172033]">
                  {percentile.value?.stroops ?? "—"}
                </td>
                <td className="py-2 font-mono text-[#4e5c73]">{percentile.value?.xlm ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function FeeStatsResult({ summary }: { summary: FeeStatsSummary }) {
  const congestion = congestionOf(summary.capacityUsage);
  const recommendation = recommendFee(summary.chargedPercentiles, congestion);

  return (
    <div className="space-y-4">
      <StatusMessage
        type={congestion === "congested" ? "warning" : congestion === "busy" ? "info" : "success"}
        title={congestionCopy[congestion].title}
        description={congestionCopy[congestion].description}
      />

      <Card>
        <CardHeader>
          <CardTitle>{copy.recommendationTitle}</CardTitle>
          <CardDescription>{recommendation.basis}</CardDescription>
        </CardHeader>
        <p className="font-mono text-2xl font-bold text-[#172033]">
          {recommendation.amount ? recommendation.amount.stroops : "—"}
          <span className="ml-2 text-sm font-semibold text-[#68758a]">stroops</span>
        </p>
        {recommendation.amount ? (
          <p className="mt-1 font-mono text-sm text-[#68758a]">{recommendation.amount.xlm} XLM</p>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.summaryTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.lastLedgerLabel, value: summary.lastLedger ?? "Not reported", mono: true },
            { label: copy.capacityLabel, value: formatCapacityUsage(summary.capacityUsage) },
            { label: copy.baseFeeLabel, value: formatFee(summary.lastLedgerBaseFee) },
            { label: copy.minLabel, value: formatFee(summary.chargedMin) },
            { label: copy.modeLabel, value: formatFee(summary.chargedMode) },
            { label: copy.maxLabel, value: formatFee(summary.chargedMax) },
            { label: copy.fetchedAtLabel, value: summary.fetchedAt.replace("T", " ").replace(/\.\d+Z$/, " UTC") }
          ]}
        />
      </Card>

      <PercentileTable
        title={copy.chargedTitle}
        description={copy.chargedExplainer}
        percentiles={summary.chargedPercentiles}
        caption="Distribution of fees actually charged across recent ledgers"
      />

      <PercentileTable
        title={copy.maxFeeTitle}
        description={copy.maxFeeExplainer}
        percentiles={summary.maxFeePercentiles}
        caption="Distribution of maximum fees offered across recent ledgers"
      />
    </div>
  );
}
