import { classifyHorizonError } from "@/core/horizon/errors";
import type { NetworkComparisonErrorCode } from "@/features/network-comparison/types";

/**
 * Maps transport failures onto this tool's error codes.
 *
 * @param error - The encountered error.
 * @returns Classified NetworkComparisonErrorCode.
 */
export function toNetworkComparisonErrorCode(error: unknown): NetworkComparisonErrorCode {
  const { code } = classifyHorizonError(error);
  if (code === "network_unavailable" || code === "timeout") {
    return "both_unreachable";
  }
  return "request_failed";
}

/**
 * Maps an endpoint error to a single-column failure explanation.
 *
 * @param error - The caught endpoint error.
 * @returns Human-readable single network error message.
 */
export function toSingleNetworkErrorMessage(error: unknown): string {
  const { code, detail } = classifyHorizonError(error);
  if (detail.title) return detail.title;
  if (code === "timeout") return "Request timed out";
  if (code === "network_unavailable") return "Network unreachable";
  return "Endpoint error";
}
