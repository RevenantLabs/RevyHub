"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseTradeHistoryInput } from "@/features/trade-history/schema";
import { loadTradeHistoryPage, runTradeHistory } from "@/features/trade-history/lib/tradeHistory";
import { toTradeHistoryErrorCode } from "@/features/trade-history/lib/tradeHistory.errors";
import type { TradeHistoryErrorCode, TradeHistoryResult } from "@/features/trade-history/types";

export type TradeHistoryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: TradeHistoryResult; paging: "idle" | "next" | "previous" }
  | { status: "error"; code: TradeHistoryErrorCode };

export function useTradeHistory() {
  const { network } = useNetwork();
  const [state, setState] = useState<TradeHistoryState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(async (raw: string) => {
    controller.current?.abort();
    const parsed = parseTradeHistoryInput(raw);
    if (isErr(parsed)) { setState({ status: "error", code: parsed.code }); return; }
    const next = new AbortController();
    controller.current = next;
    setState({ status: "loading" });
    try {
      const result: Result<TradeHistoryResult, TradeHistoryErrorCode> = await runTradeHistory(parsed.value, network, next.signal);
      if (next.signal.aborted) return;
      setState(result.ok ? { status: "success", result: result.value, paging: "idle" } : { status: "error", code: result.code });
    } catch (error) { if (!next.signal.aborted) setState({ status: "error", code: toTradeHistoryErrorCode(error) }); }
  }, [network]);

  const page = useCallback(async (direction: "next" | "previous") => {
    if (state.status !== "success") return;
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setState({ ...state, paging: direction });
    const result = await loadTradeHistoryPage(state.result, network, direction, next.signal);
    if (next.signal.aborted) return;
    setState(result.ok ? { status: "success", result: result.value, paging: "idle" } : { status: "error", code: result.code });
  }, [network, state]);

  const reset = useCallback(() => { controller.current?.abort(); setState({ status: "idle" }); }, []);
  return { state, submit, loadNext: () => page("next"), loadPrevious: () => page("previous"), reset };
}
