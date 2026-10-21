"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { runSep38QuoteViewer } from "@/features/sep38-quote-viewer/lib/sep38QuoteViewer";
import { toSep38QuoteViewerErrorCode } from "@/features/sep38-quote-viewer/lib/sep38QuoteViewer.errors";
import { parseSep38QuoteViewerInput } from "@/features/sep38-quote-viewer/schema";
import type {
  Sep38QuoteViewerErrorCode,
  Sep38QuoteViewerField,
  Sep38QuoteViewerRawInput,
  Sep38QuoteViewerResult
} from "@/features/sep38-quote-viewer/types";

export type Sep38QuoteViewerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: Sep38QuoteViewerResult }
  | { status: "error"; code: Sep38QuoteViewerErrorCode; field?: Sep38QuoteViewerField };

const IDLE: Sep38QuoteViewerState = { status: "idle" };

interface Held {
  state: Sep38QuoteViewerState;
  network: StellarNetwork;
}

export function useSep38QuoteViewer() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  // A quote belongs to the network selected when it was requested. Switching
  // networks hides it during render instead of clearing it in an effect.
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: Sep38QuoteViewerRawInput) => {
      const parsed = parseSep38QuoteViewerInput(raw);
      if (!parsed.ok) {
        requestId.current += 1;
        abortRef.current?.abort();
        setHeld({
          state: { status: "error", code: parsed.code, field: parsed.detail },
          network
        });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setHeld({ state: { status: "loading" }, network });

      try {
        const result = await runSep38QuoteViewer(raw, network, { signal: controller.signal });
        if (id !== requestId.current) return;
        setHeld({
          state: result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code },
          network
        });
      } catch (error) {
        if (id !== requestId.current) return;
        setHeld({
          state: { status: "error", code: toSep38QuoteViewerErrorCode(error) },
          network
        });
      }
    },
    [network]
  );

  const reset = useCallback(() => {
    requestId.current += 1;
    abortRef.current?.abort();
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, reset, network };
}
