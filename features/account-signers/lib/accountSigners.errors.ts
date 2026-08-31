import { classifyHorizonError } from "@/core/horizon/errors";
import type { AccountSignersErrorCode } from "@/features/account-signers/types";

/** Maps transport failures onto this slice's actionable error codes. */
export function toAccountSignersErrorCode(error: unknown): AccountSignersErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "account_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
