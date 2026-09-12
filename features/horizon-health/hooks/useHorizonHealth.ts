"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { getHorizonHealth } from "@/features/horizon-health/lib/horizonHealth";
import type {
  HorizonHealthErrorCode,
  HorizonHealthSummary
} from "@/features/horizon-health/types";

export type HorizonHealthState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; summary: HorizonHealthSummary }
  | { status: "error"; code: HorizonHealthErrorCode };

const IDLE: HorizonHealthState = { status: "idle" };

interface Held {
  state: HorizonHealthState;
  network: StellarNetwork;
}

/** State machine hook managing Horizon health diagnostic requests with network-bound staleness. */
export function useHorizonHealth() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  const state = held.network === network ? held.state : IDLE;

  const load = useCallback(async () => {
    controller.current?.abort();
    const nextController = new AbortController();
    controller.current = nextController;

    requestId.current += 1;
    const id = requestId.current;
    setHeld({ state: { status: "loading" }, network });

    try {
      const result = await getHorizonHealth(network, nextController.signal);
      if (id !== requestId.current || nextController.signal.aborted) {
        return;
      }

      setHeld({
        state: result.ok
          ? { status: "success", summary: result.value }
          : { status: "error", code: result.code },
        network
      });
    } catch {
      if (id !== requestId.current || nextController.signal.aborted) {
        return;
      }
      setHeld({
        state: { status: "error", code: "request_failed" },
        network
      });
    }
  }, [network]);

  const reset = useCallback(() => {
    controller.current?.abort();
    requestId.current += 1;
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, load, submit: load, reset };
}
