"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { parseHorizonHealthInput } from "../schema";
import { runHorizonHealth } from "../lib/horizonHealth";
import type { HorizonHealthResult, HorizonHealthErrorCode } from "../types";
export type HorizonHealthState = { status: "idle" } | {status: "loading"} | {status: "success"; result: HorizonHealthResult} | {status: "error"; code: HorizonHealthErrorCode};
export function useHorizonHealth() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<{network: StellarNetwork; state: HorizonHealthState}>({network, state: {status: "idle"}});
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const submit = useCallback(async () => {
    controller.current?.abort();
    const parsed = parseHorizonHealthInput();
    if (!parsed.ok) { setHeld({network, state: {status: "error", code: parsed.code}}); return; }
    const next = new AbortController(); controller.current = next;
    setHeld({network, state: {status: "loading"}});
    const result = await runHorizonHealth(parsed.value, network, next.signal);
    if (next.signal.aborted) return;
    setHeld({network, state: result.ok ? {status: "success", result: result.value} : {status: "error", code: result.code}});
  }, [network]);
  const reset = useCallback(() => { controller.current?.abort(); setHeld({network, state: {status: "idle"}}); }, [network]);
  return {state: held.network === network ? held.state : {status: "idle"} as HorizonHealthState, submit, reset};
}
