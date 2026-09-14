import { classifyHorizonError } from "@/core/horizon/errors";
import type { Sep12KycReferenceErrorCode } from "@/features/sep12-kyc-reference/types";

/** Maps transport failures onto this tool's own error codes. */
export function toSep12KycReferenceErrorCode(error: unknown): Sep12KycReferenceErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "not_found" ? "not_found" : "request_failed";
}
