import type { ContractStorageErrorCode } from "@/features/contract-storage/types";

/**
 * Maps transport failures onto this tool's own error codes.
 *
 * Unlike Horizon, Soroban RPC errors are returned as JSON-RPC objects rather
 * than HTTP status codes, so this classifier looks for both shapes.
 */
export function toContractStorageErrorCode(error: unknown): ContractStorageErrorCode {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("abort") || message.includes("timeout")) return "request_failed";
    if (message.includes("fetch") || message.includes("network")) return "request_failed";
    if (message.includes("failed to fetch")) return "request_failed";
  }

  const status = responseStatusOf(error);
  if (typeof status === "number" && status >= 500) return "request_failed";
  if (status === 429) return "request_failed";

  return "request_failed";
}

function responseStatusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  if ("response" in error) {
    const response = (error as { response?: { status?: number } }).response;
    if (typeof response?.status === "number") return response.status;
  }

  if ("status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }

  return undefined;
}
