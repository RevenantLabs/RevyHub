"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { getFeeStats } from "@/features/fee-stats/lib/feeStats";
import type { FeeStatsErrorCode, FeeStatsSummary } from "@/features/fee-stats/types";

export type FeeStatsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; summary: FeeStatsSummary }
  | { status: "error"; code: FeeStatsErrorCode };

const IDLE: FeeStatsState = { status: "idle" };

interface Held {
  state: FeeStatsState;
  network: StellarNetwork;
}

export function useFeeStats() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  // Fee statistics are per network, so a reading taken on one network says
  // nothing about the other. Derive the staleness rather than reset in an
  // effect — the same pattern every network-backed slice uses.
  const state = held.network === network ? held.state : IDLE;

  const load = useCallback(async () => {
    requestId.current += 1;
    const id = requestId.current;
    setHeld({ state: { status: "loading" }, network });

    const result = await getFeeStats(network);
    if (id !== requestId.current) return;

    setHeld({
      state: result.ok
        ? { status: "success", summary: result.value }
        : { status: "error", code: result.code },
      network
    });
  }, [network]);

  const reset = useCallback(() => {
    requestId.current += 1;
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, load, reset };
}
