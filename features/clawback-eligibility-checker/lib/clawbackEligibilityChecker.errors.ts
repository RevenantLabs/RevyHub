import { classifyHorizonError } from "@/core/horizon/errors";
import type { ErrorCode } from "../types";

/** Maps a Horizon transport failure onto this tool's own error codes. */
export function toErrorCode(error: unknown, notFoundCode: "issuer_not_found" | "holder_not_found"): ErrorCode {
  const { code } = classifyHorizonError(error);
  if (code === "not_found") return notFoundCode;
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}

export function unexpectedFailure(): ErrorCode {
  return "request_failed";
}
