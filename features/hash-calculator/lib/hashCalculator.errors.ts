import type { HashCalculatorErrorCode } from "@/features/hash-calculator/types";

/** Maps unexpected runtime exceptions onto feature error codes. */
export function toHashCalculatorErrorCode(error: unknown): HashCalculatorErrorCode {
  if (typeof error === "string" && error === "crypto_unavailable") {
    return "crypto_unavailable";
  }
  return "request_failed";
}
