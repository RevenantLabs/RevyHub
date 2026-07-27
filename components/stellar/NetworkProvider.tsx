"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { STELLAR_NETWORK, normalizeNetwork, type StellarNetwork } from "@/lib/stellar/horizon";

interface NetworkContextValue {
  network: StellarNetwork;
  setNetwork: (network: StellarNetwork) => void;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);
const storageKey = "revyhubx-network";

/**
 * The selected network lives in localStorage so the choice survives reloads, which
 * makes it an external store rather than React state. Reading it through
 * useSyncExternalStore lets the server render the build-time default while the
 * client picks up the stored value without a hydration mismatch.
 */
const listeners = new Set<() => void>();

/** Mirrors the last write so the switch still works when localStorage is unavailable. */
let memoryNetwork: StellarNetwork | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key !== storageKey) {
    return;
  }

  // Another tab changed the choice, so drop the mirror and re-read.
  memoryNetwork = null;
  emit();
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

function getSnapshot(): StellarNetwork {
  if (memoryNetwork !== null) {
    return memoryNetwork;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored === null ? STELLAR_NETWORK : normalizeNetwork(stored);
  } catch {
    // Private browsing modes can throw on localStorage access.
    return STELLAR_NETWORK;
  }
}

function getServerSnapshot(): StellarNetwork {
  return STELLAR_NETWORK;
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const network = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setNetwork = useCallback((next: StellarNetwork) => {
    memoryNetwork = next;

    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      // A failed write only costs persistence; the switch still applies this session.
    }

    emit();
  }, []);

  const value = useMemo<NetworkContextValue>(() => ({ network, setNetwork }), [network, setNetwork]);

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const value = useContext(NetworkContext);

  if (!value) {
    throw new Error("useNetwork must be used within NetworkProvider.");
  }

  return value;
}
