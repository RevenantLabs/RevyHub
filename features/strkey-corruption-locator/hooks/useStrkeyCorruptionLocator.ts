"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { toStrkeyCorruptionLocatorErrorCode } from "@/features/strkey-corruption-locator/lib/strkeyCorruptionLocator.errors";
import { runStrkeyCorruptionLocator } from "@/features/strkey-corruption-locator/lib/strkeyCorruptionLocator";
import { parseStrkeyCorruptionLocatorInput } from "@/features/strkey-corruption-locator/schema";
import type {
  CandidateReport,
  StrkeyCorruptionLocatorErrorCode,
  StrkeyCorruptionLocatorResult
} from "@/features/strkey-corruption-locator/types";

export type StrkeyCorruptionLocatorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: CandidateReport }
  | { status: "no_candidates"; length: number }
  | { status: "error"; code: StrkeyCorruptionLocatorErrorCode };

export function useStrkeyCorruptionLocator() {
  const { network } = useNetwork();
  const [state, setState] = useState<StrkeyCorruptionLocatorState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseStrkeyCorruptionLocatorInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<StrkeyCorruptionLocatorResult, StrkeyCorruptionLocatorErrorCode> =
          await runStrkeyCorruptionLocator(parsed.value, network, next.signal);
        if (next.signal.aborted) return;

        if (!result.ok) {
          setState({ status: "error", code: result.code });
          return;
        }

        if (result.value.outcome === "no_candidates") {
          setState({ status: "no_candidates", length: result.value.length });
          return;
        }

        setState({ status: "success", result: result.value });
      } catch (error) {
        if (next.signal.aborted) return;
        setState({ status: "error", code: toStrkeyCorruptionLocatorErrorCode(error) });
      }
    },
    [network]
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset, network };
}
