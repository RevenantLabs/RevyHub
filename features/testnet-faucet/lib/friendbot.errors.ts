import type { FaucetErrorCode } from "@/features/testnet-faucet/types";

export function toFaucetErrorCode(error: unknown): FaucetErrorCode {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("abort")) return "request_failed";
  if (message.includes("fetch") || message.includes("network")) {
    return "friendbot_unavailable";
  }

  return "request_failed";
}
