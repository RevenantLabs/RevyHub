"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { parseInput } from "../schema";
import { runSorobanRestoreReadiness } from "../lib/sorobanRestoreReadiness";
import { unexpectedFailure } from "../lib/sorobanRestoreReadiness.errors";
import type { ErrorCode, RawInput, ReadinessReport } from "../types";

export type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: ReadinessReport }
  | { status: "error"; code: ErrorCode };

interface Held {
  network: StellarNetwork;
  state: State;
}

export function useSorobanRestoreReadiness() {
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
      const parsed = parseInput(raw);
      if (!parsed.ok) {
        setHeld({ network, state: { status: "error", code: parsed.code } });
        return;
      }
      const next = new AbortController();
      controller.current = next;
      setHeld({ network, state: { status: "loading" } });
      try {
        const result = await runSorobanRestoreReadiness(parsed.value, network, next.signal);
        if (next.signal.aborted) return;
        setHeld({
          network,
          state: result.ok ? { status: "success", result: result.value } : { status: "error", code: result.code }
        });
      } catch {
        if (!next.signal.aborted) setHeld({ network, state: { status: "error", code: unexpectedFailure() } });
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
