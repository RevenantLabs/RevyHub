import { classifyHorizonError } from "@/core/horizon/errors";
import type { TestnetKeypairGeneratorErrorCode } from "@/features/testnet-keypair-generator/types";

/**
 * Maps transport failures onto this tool's own error codes.
 */
export function toTestnetKeypairGeneratorErrorCode(
  error: unknown
): TestnetKeypairGeneratorErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "rate_limited") return "rate_limited";
  if (code === "network_unavailable" || code === "server_error" || code === "timeout") {
    return "horizon_unavailable";
  }

  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("econnrefused")
  ) {
    return "horizon_unavailable";
  }

  return "request_failed";
}
