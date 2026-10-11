"use client";

import { useCallback, useState } from "react";
import { searchNetworks } from "@/features/network-passphrase-inspector/lib/networkPassphrases";
import type { NetworkErrorCode, NetworkInfo } from "@/features/network-passphrase-inspector/types";

export type NetworkState =
  | { status: "idle" }
  | { status: "success"; results: NetworkInfo[] }
  | { status: "error"; code: NetworkErrorCode };

export function useNetworkPassphraseInspector() {
  const [state, setState] = useState<NetworkState>({ status: "idle" });

  const search = useCallback((query: string, type: string = "all") => {
    const results = searchNetworks(query, type);
    setState({ status: "success", results });
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, search, reset };
}
