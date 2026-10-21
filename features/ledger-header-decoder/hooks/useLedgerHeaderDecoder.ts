"use client";

import { useCallback, useRef, useState } from "react";
import { runLedgerHeaderDecoder } from "@/features/ledger-header-decoder/lib/ledgerHeaderDecoder";
import { toLedgerHeaderDecoderErrorCode } from "@/features/ledger-header-decoder/lib/ledgerHeaderDecoder.errors";
import type { LedgerHeaderDecoderState } from "@/features/ledger-header-decoder/types";

export function useLedgerHeaderDecoder() {
  const [state, setState] = useState<LedgerHeaderDecoderState>({ status: "idle" });
  const generation = useRef(0);

  const submit = useCallback((raw: string) => {
    const current = ++generation.current;
    setState({ status: "loading" });
    // Yield one microtask so the local-processing state is observable without an artificial delay.
    void Promise.resolve().then(() => {
      if (generation.current !== current) return;
      try {
        const result = runLedgerHeaderDecoder(raw);
        setState(result.ok ? { status: "success", result: result.value } : { status: "error", code: result.code });
      } catch (error) {
        setState({ status: "error", code: toLedgerHeaderDecoderErrorCode(error) });
      }
    });
  }, []);

  const reset = useCallback(() => {
    generation.current++;
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
