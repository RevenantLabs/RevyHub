import type { ErrorCode } from "@/features/claimable-predicate-evaluator/types";
/** Decoder exceptions never expose pasted content or SDK messages to the UI. */
export function toEvaluatorErrorCode(error: unknown): ErrorCode {
  return error instanceof RangeError ? "too_large" : "malformed_data";
}
