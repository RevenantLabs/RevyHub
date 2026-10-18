import { classifyHorizonError } from "@/core/horizon/errors";
import type { OperationBrowserErrorCode } from "@/features/operation-browser/types";

/** Maps transport failures onto this tool's own error codes. */
export function toOperationBrowserErrorCode(error: unknown): OperationBrowserErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "account_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
