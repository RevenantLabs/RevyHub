import type { HorizonPaginationInspectorErrorCode } from "@/features/horizon-pagination-inspector/types";

/** Maps caught parsing or structural errors to inspector error codes. */
export function toHorizonPaginationInspectorErrorCode(
  error: unknown
): HorizonPaginationInspectorErrorCode {
  if (error instanceof SyntaxError) {
    return "invalid_json";
  }
  return "invalid_collection";
}

/** Determines whether the error represents a collection structural deficiency. */
export function isCollectionProblem(
  code: HorizonPaginationInspectorErrorCode
): boolean {
  return code === "invalid_collection" || code === "invalid_json";
}

/** Determines whether the error represents an input validation violation. */
export function isInputProblem(
  code: HorizonPaginationInspectorErrorCode
): boolean {
  return code === "empty_input" || code === "invalid_input" || code === "input_too_large";
}
