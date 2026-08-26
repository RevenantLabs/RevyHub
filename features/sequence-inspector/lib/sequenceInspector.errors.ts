import { classifyHorizonError } from "@/core/horizon/errors";
import type { SequenceInspectorErrorCode } from "@/features/sequence-inspector/types";

export function toSequenceInspectorErrorCode(error: unknown): SequenceInspectorErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "account_not_found";
  return "request_failed";
}
