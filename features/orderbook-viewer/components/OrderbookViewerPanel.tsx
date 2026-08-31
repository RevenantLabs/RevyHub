"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useOrderbookViewer } from "@/features/orderbook-viewer/hooks/useOrderbookViewer";
import { errorCopy } from "@/features/orderbook-viewer/copy";
import { OrderbookViewerForm } from "@/features/orderbook-viewer/components/OrderbookViewerForm";
import { OrderbookViewerResult } from "@/features/orderbook-viewer/components/OrderbookViewerResult";
import { OrderbookViewerEmptyState } from "@/features/orderbook-viewer/components/OrderbookViewerEmptyState";

export function OrderbookViewerPanel() {
  const { state, submit } = useOrderbookViewer();

  return (
    <div className="space-y-5">
      <Card>
        <OrderbookViewerForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <OrderbookViewerResult result={state.result} /> : null}

      {state.status === "idle" ? <OrderbookViewerEmptyState /> : null}
    </div>
  );
}
