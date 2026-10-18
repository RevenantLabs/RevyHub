"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useTradeHistory } from "@/features/trade-history/hooks/useTradeHistory";
import { errorCopy } from "@/features/trade-history/copy";
import { TradeHistoryForm } from "@/features/trade-history/components/TradeHistoryForm";
import { TradeHistoryResult } from "@/features/trade-history/components/TradeHistoryResult";
import { TradeHistoryEmptyState } from "@/features/trade-history/components/TradeHistoryEmptyState";

export function TradeHistoryPanel() {
  const { state, submit, loadNext, loadPrevious } = useTradeHistory();

  return (
    <div className="space-y-5">
      <Card>
        <TradeHistoryForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <TradeHistoryResult result={state.result} paging={state.paging} onNext={loadNext} onPrevious={loadPrevious} /> : null}

      {state.status === "idle" ? <TradeHistoryEmptyState /> : null}
    </div>
  );
}
