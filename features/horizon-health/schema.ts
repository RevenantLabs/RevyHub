import { err, ok, type Result } from "@/core/result/result";
import type { HorizonHealthErrorCode, HorizonHealthRequest } from "@/features/horizon-health/types";

/** Parses a health check request for the active network endpoint. */
export function parseHorizonHealthRequest(): Result<HorizonHealthRequest, HorizonHealthErrorCode> {
  return ok({ refreshedAt: Date.now() });
}

/** Parses optional input while rejecting any secret key values. */
export function parseHorizonHealthInput(raw?: string): Result<HorizonHealthRequest, HorizonHealthErrorCode> {
  if (raw && (raw.startsWith("S") || raw.startsWith("s"))) {
    return err("unexpected_response");
  }
  return ok({ refreshedAt: Date.now() });
}
