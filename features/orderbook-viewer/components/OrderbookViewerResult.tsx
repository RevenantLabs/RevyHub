import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/orderbook-viewer/copy";
import type { OrderbookViewerResult as ResultValue } from "@/features/orderbook-viewer/types";

function assetLabel(asset: ResultValue["selling"]): string {
  return asset.type === "native" ? "XLM" : `${asset.code}:${asset.issuer.slice(0, 6)}...`;
}

export function OrderbookViewerResult({ result }: { result: ResultValue }) {
  return (
    <div className="space-y-4">
      {result.empty ? <StatusMessage type="info" title={copy.noLiquidityTitle} description={result.emptyReason} /> : null}
      <Card>
        <CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
        <DataList items={[
          { label: copy.selling, value: assetLabel(result.selling) },
          { label: copy.buying, value: assetLabel(result.buying) },
          { label: copy.bestBid, value: result.bestBid, mono: true },
          { label: copy.bestAsk, value: result.bestAsk, mono: true },
          { label: copy.spread, value: result.spread, mono: true },
          { label: copy.spreadPercent, value: result.spreadPercent },
          { label: copy.midPrice, value: result.midPrice, mono: true },
          { label: copy.imbalance, value: result.imbalancePercent },
          { label: copy.network, value: result.network }
        ]} />
      </Card>
      {!result.empty ? <div className="grid gap-4 md:grid-cols-2">
        {[{ title: copy.bidsTitle, levels: result.bids }, { title: copy.asksTitle, levels: result.asks }].map((side) => (
          <Card key={side.title}>
            <CardHeader><CardTitle>{side.title}</CardTitle></CardHeader>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="px-2 py-1">{copy.price}</th><th className="px-2 py-1">{copy.amount}</th><th className="px-2 py-1">{copy.cumulative}</th></tr></thead><tbody>{side.levels.map((level) => <tr key={`${side.title}-${level.price}`} className="border-t"><td className="px-2 py-1 font-mono" title={level.priceDecimal}>{level.price}</td><td className="px-2 py-1 font-mono">{level.amount}</td><td className="px-2 py-1 font-mono">{level.total}</td></tr>)}</tbody></table></div>
          </Card>
        ))}
      </div> : null}
    </div>
  );
}
