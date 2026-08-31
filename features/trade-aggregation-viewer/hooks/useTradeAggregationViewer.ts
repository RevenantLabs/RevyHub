"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseTradeAggregationViewerInput } from "@/features/trade-aggregation-viewer/schema";
import { runTradeAggregationViewer } from "@/features/trade-aggregation-viewer/lib/tradeAggregationViewer";
import { toTradeAggregationViewerErrorCode } from "@/features/trade-aggregation-viewer/lib/tradeAggregationViewer.errors";
import type { TradeAggregationViewerErrorCode, TradeAggregationViewerResult } from "@/features/trade-aggregation-viewer/types";

export type TradeAggregationViewerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: TradeAggregationViewerResult }
  | { status: "error"; code: TradeAggregationViewerErrorCode };

export function useTradeAggregationViewer() {
  const { network } = useNetwork();
  const [state, setState] = useState<TradeAggregationViewerState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseTradeAggregationViewerInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<TradeAggregationViewerResult, TradeAggregationViewerErrorCode> = await runTradeAggregationViewer(
          parsed.value,
          network,
          next.signal
        );
        if (next.signal.aborted) return;
        setState(
          result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code }
        );
      } catch (error) {
        if (next.signal.aborted) return;
        setState({ status: "error", code: toTradeAggregationViewerErrorCode(error) });
      }
    },
    [network]
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
