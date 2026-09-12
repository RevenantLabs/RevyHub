import type { StrkeyInspectorErrorCode } from "@/features/strkey-inspector/types";

/**
 * Maps transport or execution failures onto this tool's own error codes.
 */
export function toStrkeyInspectorErrorCode(
  error: unknown
): StrkeyInspectorErrorCode {
  if (typeof error === "string") {
    if (
      error === "empty_input" ||
      error === "secret_seed_rejected" ||
      error === "unknown_prefix" ||
      error === "bad_checksum"
    ) {
      return error;
    }
  }
  return "request_failed";
}
