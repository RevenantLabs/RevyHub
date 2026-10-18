import { classifyHorizonError } from "@/core/horizon/errors";
import type { BalanceViewerErrorCode } from "@/features/balance-viewer/types";

export function toBalanceViewerErrorCode(error: unknown): BalanceViewerErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "account_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
