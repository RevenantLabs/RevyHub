import { classifyHorizonError } from "@/core/horizon/errors";
import type { EffectsTimelineErrorCode } from "@/features/effects-timeline/types";

/**
 * Maps transport failures onto this tool's own error codes.
 *
 * Horizon answers `/accounts/{id}/effects` with a 404 when the account itself
 * is unknown on the selected network, which is the single most common mistake
 * this tool sees, so it gets its own code rather than `request_failed`.
 */
export function toEffectsTimelineErrorCode(error: unknown): EffectsTimelineErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "account_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
