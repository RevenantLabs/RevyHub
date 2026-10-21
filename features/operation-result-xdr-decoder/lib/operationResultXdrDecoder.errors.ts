import { classifyHorizonError } from "@/core/horizon/errors";
import type { OperationResultXdrDecoderErrorCode } from "../types";
export function toOperationResultXdrDecoderErrorCode(error: unknown): OperationResultXdrDecoderErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "not_found" ? "transaction_not_found" : code === "rate_limited" ? "rate_limited" : "request_failed";
}
