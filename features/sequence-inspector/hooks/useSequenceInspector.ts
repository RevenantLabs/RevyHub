"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { isErr } from "@/core/result/result";
import { parseSequenceInspectorInput } from "@/features/sequence-inspector/schema";
import { inspectSequence } from "@/features/sequence-inspector/lib/sequenceInspector";
import type { SequenceInspectorErrorCode, SequenceInspectorResult } from "@/features/sequence-inspector/types";
import type { RawSequenceInspectorInput } from "@/features/sequence-inspector/schema";

export type SequenceInspectorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: SequenceInspectorResult }
  | { status: "error"; code: SequenceInspectorErrorCode };

const IDLE: SequenceInspectorState = { status: "idle" };

interface HeldState {
  state: SequenceInspectorState;
  network: StellarNetwork;
}

export function useSequenceInspector() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<HeldState>({ state: IDLE, network });
  const controller = useRef<AbortController | null>(null);
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: RawSequenceInspectorInput) => {
      controller.current?.abort();
      const parsed = parseSequenceInspectorInput(raw);
      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setHeld({ state: { status: "loading" }, network });

      const result = await inspectSequence(parsed.value, network, next.signal);
      if (next.signal.aborted) return;
      setHeld({
        state: result.ok
          ? { status: "success", result: result.value }
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
