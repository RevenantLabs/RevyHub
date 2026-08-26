"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseSequenceInspectorInput } from "@/features/sequence-inspector/schema";
import { inspectSequence } from "@/features/sequence-inspector/lib/sequenceInspector";
import type {
  SequenceInspectorErrorCode,
  SequenceInspectorResult
} from "@/features/sequence-inspector/types";

export type SequenceInspectorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: SequenceInspectorResult }
  | { status: "error"; code: SequenceInspectorErrorCode };

const IDLE: SequenceInspectorState = { status: "idle" };

interface Held {
  state: SequenceInspectorState;
  network: StellarNetwork;
}

export function useSequenceInspector() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (rawAccountId: string, rawBumpTarget?: string) => {
      const parsed = parseSequenceInspectorInput(rawAccountId, rawBumpTarget);

      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });

      const result = await inspectSequence(parsed.value, network);
      if (id !== requestId.current) return;

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
    requestId.current += 1;
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, reset };
}
