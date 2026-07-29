"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = (onStoreChange: () => void) => {
  if (typeof window === "undefined") return () => {};
  
  const handleOnline = () => onStoreChange();
  const handleOffline = () => onStoreChange();
  
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
};

function getOnlineStatus(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true;
}

/**
 * Hook to track browser online/offline status.
 * Uses useSyncExternalStore for reactive updates when connectivity changes.
 */
export function useOnline(): boolean {
  return useSyncExternalStore(emptySubscribe, getOnlineStatus, getServerSnapshot);
}
