import { classifyHorizonError, responseStatusOf } from "@/core/horizon/errors";
import type { DeadlineBoardErrorCode } from "../types";
export function toDeadlineBoardErrorCode(error: unknown, hasCursor = false): DeadlineBoardErrorCode {
  const status = responseStatusOf(error);
  if (status === 410 || status === 404) return "history_unavailable";
  const { code } = classifyHorizonError(error);
  if (code === "rate_limited") return "rate_limited";
  if (code === "bad_request" && hasCursor) return "invalid_cursor";
  return "request_failed";
}
