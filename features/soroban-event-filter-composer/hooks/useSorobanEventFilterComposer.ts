"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { parseInput } from "../schema";
import { composeEventFilter } from "../lib/sorobanEventFilterComposer";
import { unexpectedFailure } from "../lib/sorobanEventFilterComposer.errors";
import { toGetEventsParams } from "../lib/filter-builder";
import type { ErrorCode, EventFilterReport, GetEventsParams, RawInput } from "../types";

export type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: EventFilterReport }
  | { status: "error"; code: ErrorCode; preview: GetEventsParams | null };

interface Held {
  network: StellarNetwork;
  state: State;
}

export function useSorobanEventFilterComposer() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ network, state: { status: "idle" } });
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const reset = useCallback(() => {
    controller.current?.abort();
    setHeld({ network, state: { status: "idle" } });
  }, [network]);

  const submit = useCallback(
    async (raw: RawInput) => {
      controller.current?.abort();
      const parsed = parseInput(raw, network);
      if (!parsed.ok) {
        setHeld({ network, state: { status: "error", code: parsed.code, preview: null } });
        return;
      }
      const preview = toGetEventsParams(parsed.value);
      const next = new AbortController();
      controller.current = next;
      setHeld({ network, state: { status: "loading" } });
      try {
        const result = await composeEventFilter(parsed.value, network, [], next.signal);
        if (next.signal.aborted) return;
        setHeld({
          network,
          state: result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code, preview }
        });
      } catch {
        if (!next.signal.aborted) {
          setHeld({ network, state: { status: "error", code: unexpectedFailure(), preview } });
        }
      }
    },
    [network]
  );

  return {
    state: held.network === network ? held.state : ({ status: "idle" } as State),
    submit,
    reset
  };
}
