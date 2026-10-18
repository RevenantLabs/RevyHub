"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseOrderbookViewerInput } from "@/features/orderbook-viewer/schema";
import { runOrderbookViewer } from "@/features/orderbook-viewer/lib/orderbookViewer";
import { toOrderbookViewerErrorCode } from "@/features/orderbook-viewer/lib/orderbookViewer.errors";
import type { OrderbookViewerErrorCode, OrderbookViewerResult } from "@/features/orderbook-viewer/types";

export type OrderbookViewerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: OrderbookViewerResult }
  | { status: "error"; code: OrderbookViewerErrorCode };

export function useOrderbookViewer() {
  const { network } = useNetwork();
  const [state, setState] = useState<OrderbookViewerState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseOrderbookViewerInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<OrderbookViewerResult, OrderbookViewerErrorCode> = await runOrderbookViewer(
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
        setState({ status: "error", code: toOrderbookViewerErrorCode(error) });
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
