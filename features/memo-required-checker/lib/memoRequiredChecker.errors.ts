import { classifyHorizonError } from "@/core/horizon/errors";
import type { MemoRequiredCheckerErrorCode } from "@/features/memo-required-checker/types";

export function toMemoRequiredCheckerErrorCode(error: unknown): MemoRequiredCheckerErrorCode {
  const { code } = classifyHorizonError(error);
  if (code === "not_found") return "account_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
