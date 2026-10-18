import { classifyHorizonError } from "@/core/horizon/errors";
import type { AccountMergePreflightErrorCode } from "@/features/account-merge-preflight/types";

/** Maps transport failures onto this tool's own error codes. */
export function toAccountMergePreflightErrorCode(
  error: unknown,
  notFoundCode: "source_not_found" | "destination_not_found"
): AccountMergePreflightErrorCode {
  return classifyHorizonError(error).code === "not_found" ? notFoundCode : "request_failed";
}
