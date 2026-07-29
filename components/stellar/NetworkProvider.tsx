"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STELLAR_NETWORK, type StellarNetwork } from "@/lib/stellar/horizon";

interface NetworkContextValue {
  network: StellarNetwork;
  setNetwork: (network: StellarNetwork) => void;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);
const storageKey = "revyhubx-network";
// Keep the selected Stellar network in the URL so shared links preserve the intended context.
const networkQueryParam = "network";

function normalizeNetwork(value: string | null | undefined): StellarNetwork | null {
  if (value === "mainnet") {
    return "mainnet";
  }

  if (value === "testnet") {
    return "testnet";
  }

  return null;
}

function readInitialNetwork(): StellarNetwork {
  if (typeof window === "undefined") {
    return STELLAR_NETWORK;
  }

  const urlNetwork = normalizeNetwork(
    new URLSearchParams(window.location.search).get(networkQueryParam)
  );

  if (urlNetwork) {
    return urlNetwork;
  }

  const storedNetwork = normalizeNetwork(window.localStorage.getItem(storageKey));

  if (storedNetwork) {
    return storedNetwork;
  }

  return STELLAR_NETWORK;
}

function syncNetworkUrl(network: StellarNetwork) {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  const nextSearchParams = new URLSearchParams(url.search);
  nextSearchParams.set(networkQueryParam, network);
  url.search = nextSearchParams.toString();
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetworkState] = useState<StellarNetwork>(readInitialNetwork);

  useEffect(() => {
    window.localStorage.setItem(storageKey, network);
    syncNetworkUrl(network);
  }, [network]);

  const value = useMemo<NetworkContextValue>(
    () => ({
      network,
      setNetwork: setNetworkState
    }),
    [network]
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const value = useContext(NetworkContext);

  if (!value) {
    throw new Error("useNetwork must be used within NetworkProvider.");
  }

  return value;
}
