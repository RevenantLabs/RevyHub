import type { PredicateBuilderErrorCode } from "@/features/predicate-builder/types";

/**
 * Maps unexpected exceptions to the tool's error codes.
 * 
 * This tool is local-only, so network errors are not expected.
 * Any exception during encoding is treated as encoding_failed.
 */
export function toPredicateBuilderErrorCode(error: unknown): PredicateBuilderErrorCode {
  // Log for debugging but don't expose internals to the user
  if (error instanceof Error) {
    console.error("Predicate encoding failed:", error.message);
  }
  
  return "encoding_failed";
}
