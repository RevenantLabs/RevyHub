import { classifyHorizonError } from "@/core/horizon/errors";
import type { ClaimableBalanceReadinessErrorCode } from "@/features/claimable-balance-readiness/types";

/** Maps transport failures onto this tool's own error codes. */
export function toClaimableBalanceReadinessErrorCode(
  error: unknown
): ClaimableBalanceReadinessErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "balance_not_found";
  return "request_failed";
}
