"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useTradeAggregationViewer } from "@/features/trade-aggregation-viewer/hooks/useTradeAggregationViewer";
import { errorCopy } from "@/features/trade-aggregation-viewer/copy";
import { TradeAggregationViewerForm } from "@/features/trade-aggregation-viewer/components/TradeAggregationViewerForm";
import { TradeAggregationViewerResult } from "@/features/trade-aggregation-viewer/components/TradeAggregationViewerResult";
import { TradeAggregationViewerEmptyState } from "@/features/trade-aggregation-viewer/components/TradeAggregationViewerEmptyState";

export function TradeAggregationViewerPanel() {
  const { state, submit } = useTradeAggregationViewer();

  return (
    <div className="space-y-5">
      <Card>
        <TradeAggregationViewerForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <TradeAggregationViewerResult result={state.result} /> : null}

      {state.status === "idle" ? <TradeAggregationViewerEmptyState /> : null}
    </div>
  );
}
