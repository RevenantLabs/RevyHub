"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRecentlyUsedTools, type RecentlyUsedTool } from "@/hooks/useRecentlyUsedTools";

interface RecentToolsContextValue {
  recentTools: RecentlyUsedTool[];
  recordTool: (routeId: string) => void;
  clearHistory: () => void;
  isAvailable: boolean;
}

const RecentToolsContext = createContext<RecentToolsContextValue | null>(null);

export function RecentToolsProvider({ children }: { children: ReactNode }) {
  const { recentTools, recordTool, clearHistory, isAvailable } = useRecentlyUsedTools();

  return (
    <RecentToolsContext.Provider value={{ recentTools, recordTool, clearHistory, isAvailable }}>
      {children}
    </RecentToolsContext.Provider>
  );
}

export function useRecentToolsContext(): RecentToolsContextValue {
  const context = useContext(RecentToolsContext);
  if (!context) {
    throw new Error("useRecentToolsContext must be used within RecentToolsProvider");
  }
  return context;
}
