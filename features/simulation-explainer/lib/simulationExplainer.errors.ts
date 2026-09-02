import type { SimulationExplainerErrorCode } from "@/features/simulation-explainer/types";

/**
 * Maps transport failures onto this tool's own error codes.
 *
 * Soroban RPC returns errors as JSON-RPC objects, so this classifier only
 * handles fetch-level and unexpected transport failures.
 */
export function toSimulationExplainerErrorCode(
  error: unknown
): SimulationExplainerErrorCode {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("abort") || message.includes("timeout")) return "request_failed";
    if (message.includes("fetch") || message.includes("network")) return "request_failed";
  }

  return "request_failed";
}
