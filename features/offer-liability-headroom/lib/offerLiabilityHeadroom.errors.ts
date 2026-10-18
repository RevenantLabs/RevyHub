import { classifyHorizonError } from "@/core/horizon/errors";
import type { OfferLiabilityHeadroomErrorCode } from "@/features/offer-liability-headroom/types";

export function toOfferLiabilityHeadroomErrorCode(error: unknown): OfferLiabilityHeadroomErrorCode {
  const { code } = classifyHorizonError(error);
  if (code === "not_found") return "account_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}

export class HorizonStatusError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Horizon responded with ${status}`);
    this.name = "HorizonStatusError";
    this.status = status;
  }
}
