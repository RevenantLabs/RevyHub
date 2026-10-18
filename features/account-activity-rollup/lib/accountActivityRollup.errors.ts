import { classifyHorizonError } from "@/core/horizon/errors";
import type { AccountActivityRollupErrorCode } from "@/features/account-activity-rollup/types";

export function toAccountActivityRollupErrorCode(error: unknown, paging: boolean): AccountActivityRollupErrorCode {
  const { code, detail } = classifyHorizonError(error);
  if (detail.status === 410 || detail.status === 501) return "history_unavailable";
  if (paging && code === "bad_request") return "invalid_cursor";
  if (code === "not_found") return paging ? "history_unavailable" : "account_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
