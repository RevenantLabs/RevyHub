import type { ClaimablePredicateBuilderErrorCode } from "@/features/claimable-predicate-builder/types";

/** Maps unexpected runtime failures onto this tool's own error codes. */
export function toClaimablePredicateBuilderErrorCode(error: unknown): ClaimablePredicateBuilderErrorCode {
  if (error instanceof Error && error.message.includes("encoding")) {
    return "encoding_failed";
  }
  return "encoding_failed";
}
