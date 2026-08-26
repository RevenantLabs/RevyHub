import { classifyHorizonError } from "@/core/horizon/errors";
import type { AccountMergePreflightErrorCode } from "@/features/account-merge-preflight/types";

/** Maps transport failures onto this tool's own error codes. */
export function toAccountMergePreflightErrorCode(error: unknown): AccountMergePreflightErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "not_found" ? "not_found" : "request_failed";
}
