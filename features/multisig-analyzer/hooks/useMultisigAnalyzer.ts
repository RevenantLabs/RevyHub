"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseMultisigAnalyzerInput } from "@/features/multisig-analyzer/schema";
import { runMultisigAnalyzer } from "@/features/multisig-analyzer/lib/multisigAnalyzer";
import { toMultisigAnalyzerErrorCode } from "@/features/multisig-analyzer/lib/multisigAnalyzer.errors";
import type {
  MultisigAnalyzerErrorCode,
  MultisigAnalyzerInput,
  MultisigAnalyzerResult
} from "@/features/multisig-analyzer/types";

export type MultisigAnalyzerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: MultisigAnalyzerResult }
  | { status: "error"; code: MultisigAnalyzerErrorCode };

export function useMultisigAnalyzer() {
  const { network } = useNetwork();
  const [state, setState] = useState<MultisigAnalyzerState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: MultisigAnalyzerInput | Partial<MultisigAnalyzerInput> | string) => {
      controller.current?.abort();
      const parsed = parseMultisigAnalyzerInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<MultisigAnalyzerResult, MultisigAnalyzerErrorCode> = await runMultisigAnalyzer(
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
        setState({ status: "error", code: toMultisigAnalyzerErrorCode(error) });
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
