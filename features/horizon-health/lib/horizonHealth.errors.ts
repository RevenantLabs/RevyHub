import { classifyHorizonError } from "@/core/horizon/errors";
import type { HorizonHealthErrorCode } from "../types";
export function toHorizonHealthErrorCode(error: unknown): HorizonHealthErrorCode {
  return classifyHorizonError(error).code === "network_unavailable" ? "endpoint_unreachable" : "request_failed";
}
