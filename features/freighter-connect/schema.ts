import { err, ok, type Result } from "@/core/result/result";
import type { FreighterApi, FreighterErrorCode } from "@/features/freighter-connect/types";

/**
 * Reads the injected API off `window` and checks it exposes the methods this
 * tool needs. Extension APIs change between versions, so a partially present
 * object is treated as a distinct, reportable state rather than a crash.
 */
export function readFreighterApi(
  target: unknown = typeof window === "undefined" ? undefined : window
): Result<FreighterApi, FreighterErrorCode> {
  const api = (target as { freighterApi?: FreighterApi } | undefined)?.freighterApi;

  if (!api) return err("not_installed");
  if (typeof api.getPublicKey !== "function" || typeof api.getNetwork !== "function") {
    return err("api_incomplete");
  }

  return ok(api);
}
