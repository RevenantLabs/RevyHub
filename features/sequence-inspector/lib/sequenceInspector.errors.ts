import { classifyHorizonError } from "@/core/horizon/errors";
import type { SequenceInspectorErrorCode } from "@/features/sequence-inspector/types";

/** Maps transport failures onto this tool's own error codes. */
export function toSequenceInspectorErrorCode(error: unknown): SequenceInspectorErrorCode {
  return classifyHorizonError(error).code === "not_found"
    ? "account_not_found"
    : "request_failed";
}
