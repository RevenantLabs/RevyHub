export interface SponsoredReservesInput {
  value: string;
}

export interface SponsoredReservesResult {
  summary: string;
}

export type SponsoredReservesErrorCode = "empty_input" | "invalid_input" | "not_found" | "request_failed";
