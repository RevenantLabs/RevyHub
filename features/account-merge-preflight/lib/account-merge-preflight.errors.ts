import { classifyHorizonError } from "@/core/horizon/errors";
import type { AccountMergePreflightErrorCode } from "@/features/account-merge-preflight/types";

export function toAccountMergePreflightErrorCode(error: unknown): AccountMergePreflightErrorCode {
  const { code: horizonCode } = classifyHorizonError(error);
  if (horizonCode === "not_found") {
    // This is just a fallback, in our logic we specifically return source/dest not found
    return "source_not_found"; 
  }
  return "request_failed";
}
