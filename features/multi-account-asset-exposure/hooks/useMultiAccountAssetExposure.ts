"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { parseMultiAccountAssetExposureInput } from "../schema";
import { runMultiAccountAssetExposure } from "../lib/multiAccountAssetExposure";
import type { MultiAccountAssetExposureErrorCode as Code, MultiAccountAssetExposureResult as Exposure } from "../types";
import type { StellarNetwork } from "@/core/network/types";

export type MultiAccountAssetExposureState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: Exposure }
  | { status: "error"; code: Code };
interface Held { network: StellarNetwork; state: MultiAccountAssetExposureState }
export function useMultiAccountAssetExposure() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ network, state: { status: "idle" } });
  const controller = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  const state = held.network === network ? held.state : { status: "idle" } as const;

  useEffect(() => () => controller.current?.abort(), []);
  const submit = useCallback(async (raw: string) => {
    controller.current?.abort();
    const id = ++requestId.current;
    const parsed = parseMultiAccountAssetExposureInput(raw);
    if (!parsed.ok) {
      setHeld({ network, state: { status: "error", code: parsed.code } });
      return;
    }
    const next = new AbortController();
    controller.current = next;
    setHeld({ network, state: { status: "loading" } });
    try {
      const result = await runMultiAccountAssetExposure(parsed.value, network, next.signal);
      if (id !== requestId.current || next.signal.aborted) return;
      setHeld({ network, state: result.ok
        ? { status: "success", result: result.value }
        : { status: "error", code: result.code } });
    } catch {
      if (id !== requestId.current || next.signal.aborted) return;
      setHeld({ network, state: { status: "error", code: "request_failed" } });
    }
  }, [network]);
  const reset = useCallback(() => {
    controller.current?.abort();
    requestId.current++;
    setHeld({ network, state: { status: "idle" } });
  }, [network]);
  return { state, submit, reset };
}
