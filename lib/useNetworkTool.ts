"use client";

import { useCallback } from "react";
import { useOnline } from "@/lib/useOnline";

/**
 * Hook for network-backed tools to handle offline state.
 * Provides utilities to check connectivity before making requests.
 */
export function useNetworkTool() {
  const isOnline = useOnline();

  /**
   * Wraps an async function to check online status before execution.
   * Returns an error message if offline, otherwise executes the function.
   */
  const executeIfOnline = useCallback(
    async <T>(
      fn: () => Promise<T>,
      options?: { offlineError?: string }
    ): Promise<{ data?: T; error?: string }> => {
      if (!isOnline) {
        return {
          error: options?.offlineError ?? "You're offline. Please check your internet connection."
        };
      }

      try {
        const data = await fn();
        return { data };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "An unexpected error occurred."
        };
      }
    },
    [isOnline]
  );

  /**
   * Returns true if the tool can perform network operations.
   */
  const canPerformNetworkOps = isOnline;

  return {
    isOnline,
    canPerformNetworkOps,
    executeIfOnline
  };
}
