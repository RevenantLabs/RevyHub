import { classifyHorizonError } from "@/core/horizon/errors";
import type { SponsoredReservesErrorCode } from "@/features/sponsored-reserves/types";

export function toSponsoredReservesErrorCode(error: unknown): SponsoredReservesErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "account_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
