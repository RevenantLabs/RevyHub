import type { Sep10InspectorErrorCode } from "@/features/sep10-inspector/types";

/** Maps transport failures onto this tool's own error codes. */
export function toSep10InspectorErrorCode(error: unknown): Sep10InspectorErrorCode {
  return error instanceof Error && error.message.includes("expired") ? "expired_challenge" : "request_failed";
}
