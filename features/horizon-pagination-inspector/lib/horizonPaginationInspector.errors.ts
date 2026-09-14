import { classifyHorizonError } from "@/core/horizon/errors";
import type { HorizonPaginationInspectorErrorCode } from "@/features/horizon-pagination-inspector/types";

/** Maps transport failures onto this tool's own error codes. */
export function toHorizonPaginationInspectorErrorCode(error: unknown): HorizonPaginationInspectorErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "not_found" ? "not_found" : "request_failed";
}
