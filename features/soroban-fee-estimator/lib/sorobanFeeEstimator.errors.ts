import type { SorobanFeeEstimatorErrorCode } from "@/features/soroban-fee-estimator/types";

/** Maps transport failures onto this tool's own error codes. */
export function toSorobanFeeEstimatorErrorCode(
  error: unknown
): SorobanFeeEstimatorErrorCode {
  if (error instanceof Error) {
    if (error.message.includes("abort")) return "request_failed";
    if (error.message.includes("timeout")) return "request_failed";
  }
  return "request_failed";
}
