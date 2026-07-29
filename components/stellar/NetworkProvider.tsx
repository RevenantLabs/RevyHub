"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { StellarNetwork } from "@/lib/stellar/horizon";

interface NetworkContextValue {
  network: StellarNetwork;
  setNetwork: (network: StellarNetwork) => void;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);
const storageKey = "revyhubx-network";

function readInitialNetwork(): StellarNetwork {
  if (typeof window === "undefined") {
    return "testnet";
  }

  try {
    return window.localStorage.getItem(storageKey) === "mainnet" ? "mainnet" : "testnet";
  } catch {
    return "testnet";
  }
}

function persistNetwork(network: StellarNetwork) {
  try {
    window.localStorage.setItem(storageKey, network);
  } catch {
    // Storage can be unavailable because of browser privacy or quota restrictions.
  }
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetworkState] = useState<StellarNetwork>(readInitialNetwork);

  useEffect(() => {
    persistNetwork(network);
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
