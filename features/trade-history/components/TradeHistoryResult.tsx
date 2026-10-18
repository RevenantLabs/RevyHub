import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { Button } from "@/core/ui/Button";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/trade-history/copy";
import { formatAsset } from "@/features/trade-history/lib/format";
import type { TradeHistoryResult as ResultValue, TradeHistoryRecord } from "@/features/trade-history/types";

function sideLabel(record: TradeHistoryRecord, side: "base" | "counter"): string {
  const value = record[side];
  return `${formatAsset(value.asset)} ${value.amount} (${value.account ? `${value.account.slice(0, 6)}...` : copy.notAvailable})`;
}

export function TradeHistoryResult({ result, paging, onNext, onPrevious }: { result: ResultValue; paging: "idle" | "next" | "previous"; onNext: () => void; onPrevious: () => void }) {
  return (
    <div className="space-y-4">
      {result.noTrades ? <StatusMessage type="info" title={copy.noTradesTitle} description={copy.noTradesDescription} /> : null}
      <Card>
        <CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
        <DataList items={[
          { label: copy.filter, value: result.filterMode },
          { label: copy.summary, value: copy.summaryValue(result.page, result.total), mono: true },
          { label: copy.network, value: result.network },
          ...(result.account ? [{ label: copy.account, value: `${result.account.slice(0, 8)}...`, mono: true }] : []),
          ...(result.base && result.counter ? [{ label: copy.pair, value: `${formatAsset(result.base)}/${formatAsset(result.counter)}` }] : [])
        ]} />
      </Card>
      {!result.noTrades ? <div className="space-y-3">{result.records.map((trade) => <Card key={trade.id}>
        <DataList items={[
          { label: copy.timestamp, value: trade.ledgerCloseTime, mono: true },
          { label: copy.baseSide, value: sideLabel(trade, "base") },
          { label: copy.counterSide, value: sideLabel(trade, "counter") },
          { label: copy.price, value: trade.price, mono: true },
          { label: copy.kind, value: trade.kind === "liquidity_pool" ? copy.liquidityPool : copy.orderbook },
          ...(trade.liquidityPoolId ? [{ label: copy.pool, value: `${trade.liquidityPoolId.slice(0, 8)}...`, mono: true }] : []),
          ...(trade.offerId ? [{ label: copy.offer, value: trade.offerId, mono: true }] : [])
        ]} />
      </Card>)}</div> : null}
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" disabled={!result.hasPrevious || paging !== "idle"} onClick={onPrevious}>{paging === "previous" ? copy.working : copy.previous}</Button>
        <Button type="button" disabled={!result.hasNext || paging !== "idle"} onClick={onNext}>{paging === "next" ? copy.working : copy.next}</Button>
      </div>
    </div>
  );
}
