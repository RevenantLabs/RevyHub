"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import {
  DEFAULT_NETWORK,
  HORIZON_URLS,
  NETWORK_LABELS,
  NETWORK_PASSPHRASES,
  NETWORK_STORAGE_KEY,
  SOROBAN_RPC_URLS
} from "@/core/network/config";
import { isStellarNetwork, type StellarNetwork } from "@/core/network/types";

export interface NetworkContextValue {
  network: StellarNetwork;
  label: string;
  horizonUrl: string;
  sorobanRpcUrl: string;
  networkPassphrase: string;
  setNetwork: (network: StellarNetwork) => void;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

/**
 * The selected network lives in `localStorage`, which is an external store
 * rather than React state. Reading it through `useSyncExternalStore` gives the
 * correct server snapshot during SSR (no hydration mismatch) without an effect
 * that sets state on mount — and subscribing to the `storage` event keeps two
 * open tabs in agreement for free.
 */
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): StellarNetwork {
  try {
    const stored = window.localStorage.getItem(NETWORK_STORAGE_KEY);
    return isStellarNetwork(stored) ? stored : DEFAULT_NETWORK;
  } catch {
    // Private windows and blocked site data both throw here.
    return DEFAULT_NETWORK;
  }
}

function getServerSnapshot(): StellarNetwork {
  return DEFAULT_NETWORK;
}

/**
 * Persists the choice and notifies subscribers. Returns `false` when storage
 * refused the write, which happens in private windows and when site data is
 * blocked.
 */
function writeNetwork(network: StellarNetwork): boolean {
  try {
    window.localStorage.setItem(NETWORK_STORAGE_KEY, network);
  } catch {
    return false;
  }

  for (const listener of listeners) listener();
  return true;
}

export function NetworkProvider({
  children,
  initialNetwork
}: {
  children: React.ReactNode;
  /** Forces a network regardless of stored preference. Used by tests. */
  initialNetwork?: StellarNetwork;
}) {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [override, setOverride] = useState<StellarNetwork | undefined>(initialNetwork);
  const network = override ?? stored;

  const setNetwork = useCallback((next: StellarNetwork) => {
    // When storage refuses the write the choice still has to apply for this
    // session, so it is held in the provider. Without that the snapshot would
    // be re-read from storage and the UI would snap straight back to the value
    // the user just changed away from.
    setOverride(writeNetwork(next) ? undefined : next);
  }, []);

  const value = useMemo<NetworkContextValue>(
    () => ({
      network,
      label: NETWORK_LABELS[network],
      horizonUrl: HORIZON_URLS[network],
      sorobanRpcUrl: SOROBAN_RPC_URLS[network],
      networkPassphrase: NETWORK_PASSPHRASES[network],
      setNetwork
    }),
    [network, setNetwork]
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork(): NetworkContextValue {
  const value = useContext(NetworkContext);
  if (!value) throw new Error("useNetwork must be used within a NetworkProvider.");
  return value;
}
