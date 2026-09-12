"use client";

import { useCallback, useRef, useState } from "react";
import { parseNetworkComparisonInput } from "@/features/network-comparison/schema";
import { runNetworkComparison } from "@/features/network-comparison/lib/networkComparison";
import type {
  NetworkComparisonErrorCode,
  NetworkComparisonResult
} from "@/features/network-comparison/types";

export type NetworkComparisonState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: NetworkComparisonResult }
  | { status: "error"; code: NetworkComparisonErrorCode; partial?: NetworkComparisonResult };

export interface UseNetworkComparisonReturn {
  state: NetworkComparisonState;
  load: () => Promise<void>;
  reset: () => void;
}

/**
 * State machine for the network comparison tool.
 * Queries both Testnet and Mainnet concurrently without dependency on active header network.
 *
 * @returns State object, load function, and reset function.
 */
export function useNetworkComparison(): UseNetworkComparisonReturn {
  const [state, setState] = useState<NetworkComparisonState>({ status: "idle" });
  const requestId = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    requestId.current += 1;
    const id = requestId.current;
    setState({ status: "loading" });

    const parsed = parseNetworkComparisonInput();
    if (!parsed.ok) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = await runNetworkComparison(parsed.value, controller.signal);
    if (id !== requestId.current) return;

    if (result.ok) {
      setState({ status: "success", data: result.value });
    } else {
      setState({
        status: "error",
        code: result.code,
        partial: result.detail
      });
    }
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    requestId.current += 1;
    setState({ status: "idle" });
  }, []);

  return { state, load, reset };
}
