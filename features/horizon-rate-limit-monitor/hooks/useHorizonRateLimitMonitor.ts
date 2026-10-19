"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { getHorizonRateLimits } from "@/features/horizon-rate-limit-monitor/lib/horizonRateLimitMonitor";
import type { MonitorState } from "@/features/horizon-rate-limit-monitor/types";

export function useHorizonRateLimitMonitor() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<{ network: StellarNetwork; epoch: number; state: MonitorState }>({ network, epoch: 0, state: { status: "idle" } });
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const previousNetwork = useRef(network);
  const [epoch, setEpoch] = useState(0);
  useEffect(() => {
    if (previousNetwork.current !== network) {
      previousNetwork.current = network;
      setEpoch((value) => value + 1);
    }
    return () => { requestId.current += 1; controller.current?.abort(); };
  }, [network]);
  const state: MonitorState = held.network === network && held.epoch === epoch ? held.state : { status: "idle" };
  const check = useCallback(async (accountId: string, threshold: string) => {
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    const id = ++requestId.current;
    setHeld({ network, epoch, state: { status: "loading" } });
    const result = await getHorizonRateLimits(network, accountId, threshold, next.signal);
    if (id !== requestId.current || next.signal.aborted) return;
    setHeld({ network, epoch, state: result.ok ? { status: "success", result: result.value } : { status: "error", code: result.code } });
  }, [network, epoch]);
  return { state, check };
}
