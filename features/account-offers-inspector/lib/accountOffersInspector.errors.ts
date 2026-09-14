import type { AccountOffersErrorCode } from "@/features/account-offers-inspector/types";

export function toAccountOffersErrorCode(e: unknown): AccountOffersErrorCode {
  if (e && typeof e === "object" && "response" in e) {
    const resp = (e as { response?: { status?: number } }).response;
    if (resp?.status === 404) return "account_not_found";
    if (resp?.status === 429) return "rate_limited";
  }
  return "request_failed";
}
