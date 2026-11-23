import { classifyHorizonError } from "@/core/horizon/errors";
import type { ErrorCode } from "@/features/transaction-sequence-gap-auditor/types";

export class HorizonResponseError extends Error {
  constructor(public readonly status: number) {
    super(`Horizon request failed with status ${status}`);
    this.name = "HorizonResponseError";
  }
}

export class PageDecodeError extends Error {
  constructor(public readonly code: Extract<ErrorCode, "malformed_data" | "too_large">) {
    super(code);
    this.name = "PageDecodeError";
  }
}

export function toTransactionSequenceGapAuditorErrorCode(error: unknown): ErrorCode {
  if (error instanceof PageDecodeError) return error.code;
  const { code } = classifyHorizonError(error);
  if (code === "not_found") return "not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
