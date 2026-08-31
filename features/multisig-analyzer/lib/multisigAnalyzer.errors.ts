import { classifyHorizonError } from "@/core/horizon/errors";
import type { MultisigAnalyzerErrorCode } from "@/features/multisig-analyzer/types";

/** Maps transport failures onto this tool's own error codes. */
export function toMultisigAnalyzerErrorCode(error: unknown): MultisigAnalyzerErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "account_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
