import { classifyHorizonError } from "@/core/horizon/errors";
import type { HorizonHealthErrorCode } from "@/features/horizon-health/types";

/** Maps lower-level transport and HTTP failures onto HorizonHealthErrorCode values. */
export function toHorizonHealthErrorCode(error: unknown): HorizonHealthErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "network_unavailable" || code === "timeout") {
    return "endpoint_unreachable";
  }

  return "request_failed";
}
