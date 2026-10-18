import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/trade-aggregation-viewer/copy";
import { formatResolution } from "@/features/trade-aggregation-viewer/lib/format";
import type { TradeAggregationViewerResult as ResultValue } from "@/features/trade-aggregation-viewer/types";

function assetLabel(asset: ResultValue["base"]): string { return asset.type === "native" ? "XLM" : `${asset.code}:${asset.issuer.slice(0, 6)}...`; }

export function TradeAggregationViewerResult({ result }: { result: ResultValue }) {
  return (
    <div className="space-y-4">
      {result.noTrades ? <StatusMessage type="info" title={copy.noTradesTitle} description={copy.noTradesDescription} /> : null}
      <Card>
        <CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
        <DataList items={[
          { label: copy.base, value: assetLabel(result.base) },
          { label: copy.counter, value: assetLabel(result.counter) },
          { label: copy.resolution, value: `${formatResolution(result.resolution)} (${result.resolution} ms)` },
          { label: copy.usedRange, value: `${result.usedStart} - ${result.usedEnd}`, mono: true },
          { label: copy.summary, value: copy.summaryValue(result.totalTrades, result.totalBaseVolume, result.totalCounterVolume), mono: true },
          { label: copy.network, value: result.network }
        ]} />
      </Card>
      {!result.noTrades ? <Card>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="px-2 py-1">{copy.usedRange}</th><th className="px-2 py-1">{copy.open}</th><th className="px-2 py-1">{copy.high}</th><th className="px-2 py-1">{copy.low}</th><th className="px-2 py-1">{copy.close}</th><th className="px-2 py-1">{copy.baseVolume}</th><th className="px-2 py-1">{copy.counterVolume}</th><th className="px-2 py-1">{copy.trades}</th></tr></thead><tbody>{result.buckets.map((bucket) => <tr key={bucket.timestamp} className="border-t"><td className="px-2 py-1 font-mono">{bucket.start}</td><td className="px-2 py-1 font-mono">{bucket.open}</td><td className="px-2 py-1 font-mono">{bucket.high}</td><td className="px-2 py-1 font-mono">{bucket.low}</td><td className="px-2 py-1 font-mono">{bucket.close}</td><td className="px-2 py-1 font-mono">{bucket.baseVolume}</td><td className="px-2 py-1 font-mono">{bucket.counterVolume}</td><td className="px-2 py-1">{bucket.tradeCount}</td></tr>)}</tbody></table></div>
      </Card> : null}
    </div>
  );
}
