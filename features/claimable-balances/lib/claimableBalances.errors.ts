import { classifyHorizonError } from "@/core/horizon/errors";
import type { ClaimableBalancesErrorCode } from "@/features/claimable-balances/types";

/** Maps transport failures onto this tool's own error codes. */
export function toClaimableBalancesErrorCode(error: unknown): ClaimableBalancesErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "balance_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
