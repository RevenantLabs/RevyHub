"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parsePreconditionsInput } from "@/features/preconditions-explainer/schema";
import { explainPreconditions } from "@/features/preconditions-explainer/lib/preconditionsExplainer";
import type {
  PreconditionsErrorCode,
  PreconditionsExplanation
} from "@/features/preconditions-explainer/types";

export type PreconditionsExplainerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; explanation: PreconditionsExplanation }
  | { status: "error"; code: PreconditionsErrorCode };

const IDLE: PreconditionsExplainerState = { status: "idle" };

interface Held {
  state: PreconditionsExplainerState;
  network: StellarNetwork;
}

/**
 * The four states of the explainer, tagged with the network they belong to.
 *
 * A verdict is only meaningful next to the ledger it was computed against, so
 * switching networks derives the answer away during render rather than
 * clearing it from an effect.
 */
export function usePreconditionsExplainer() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const controller = useRef<AbortController | null>(null);

  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();

      const parsed = parsePreconditionsInput(raw);
      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setHeld({ state: { status: "loading" }, network });

      const result = await explainPreconditions(parsed.value, network, next.signal);
      if (next.signal.aborted) return;

      setHeld({
        state: result.ok
          ? { status: "success", explanation: result.value }
          : { status: "error", code: result.code },
        network
      });
    },
    [network]
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, reset };
}
