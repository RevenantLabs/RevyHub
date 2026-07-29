"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
  clearRecentTools,
  getRecentTools,
  recordToolUse,
  type RecentToolEntry
} from "@/lib/recentlyUsedTools";

const TOOL_ROUTE_PREFIX = "/tools/";

export interface RecentlyUsedTool extends RecentToolEntry {
  /** The tool's display title */
  title: string;
  /** The Lucide icon component */
  iconName: string;
}

export interface UseRecentlyUsedToolsReturn {
  /** List of recently used tools with metadata, sorted by most recent first */
  recentTools: RecentlyUsedTool[];
  /** Record that a tool was used (called when navigating to a tool) */
  recordTool: (routeId: string) => void;
  /** Clear all recent tool history */
  clearHistory: () => void;
  /** Whether the history feature is available */
  isAvailable: boolean;
}

function enrichToolEntry(entry: RecentToolEntry): RecentlyUsedTool | null {
  const metadata = TOOL_METADATA[entry.routeId];
  if (!metadata) return null;

  return {
    ...entry,
    title: metadata.title,
    iconName: metadata.iconName
  };
}

function loadRecentTools(): RecentlyUsedTool[] {
  const entries = getRecentTools();
  return entries
    .map((entry) => enrichToolEntry(entry))
    .filter((tool): tool is RecentlyUsedTool => tool !== null);
}

/**
 * Hook to manage recently used tools state.
 * Integrates with the tools constant to enrich entries with display metadata.
 */
export function useRecentlyUsedTools(): UseRecentlyUsedToolsReturn {
  const [recentTools, setRecentTools] = useState<RecentlyUsedTool[]>(() => {
    if (typeof window === "undefined") return [];
    return loadRecentTools();
  });
  const [isAvailable, setIsAvailable] = useState(false);
  const isInitialized = useRef(false);

  // Subscribe to storage changes from other tabs/windows
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Check availability of localStorage
    const hasLocalStorage = typeof window !== "undefined" && window.localStorage != null;
    setIsAvailable(hasLocalStorage);

    // Listen for storage changes from other tabs/windows
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "revyhub_recent_tools") {
        setRecentTools(loadRecentTools());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const recordTool = useCallback((routeId: string) => {
    // Only record tool routes
    if (!routeId.startsWith(TOOL_ROUTE_PREFIX)) return;
    recordToolUse(routeId);
    // Immediately refresh the state
    setRecentTools(loadRecentTools());
  }, []);

  const clearHistory = useCallback(() => {
    clearRecentTools();
    setRecentTools([]);
  }, []);

  return { recentTools, recordTool, clearHistory, isAvailable };
}

// Map of route IDs to their display names
const TOOL_METADATA: Record<string, { title: string; iconName: string }> = {
  "/tools/address-validator": { title: "Address Validator", iconName: "ShieldCheck" },
  "/tools/balance-viewer": { title: "Balance Viewer", iconName: "CircleDollarSign" },
  "/tools/trustline-checker": { title: "Trustline Checker", iconName: "BadgeCheck" },
  "/tools/payment-qr": { title: "Payment QR Generator", iconName: "QrCode" },
  "/tools/transaction-lookup": { title: "Transaction Lookup", iconName: "Search" },
  "/tools/freighter-connect": { title: "Freighter Connect", iconName: "WalletCards" },
  "/tools/testnet-faucet": { title: "Testnet Faucet Helper", iconName: "Droplets" }
};
