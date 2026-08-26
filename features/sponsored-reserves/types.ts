export type SponsoredReservesErrorCode =
  | "empty_input"
  | "invalid_address"
  | "account_not_found"
  | "rate_limited"
  | "request_failed";

export interface SponsoredReservesInput {
  accountId: string;
}

export interface SponsoredEntry {
  type: "account" | "balance" | "signer" | "offer";
  details: string; // e.g. "XLM", "Signer G...", "Account", "Offer 123"
  sponsor: string;
}

export interface SponsoringEntry {
  type: "account" | "balance" | "signer" | "offer";
  details: string;
  accountSponsored: string; // The account that owns the subentry (or the account itself)
}

export interface SponsoredReservesResultData {
  accountId: string;
  sponsoredByOthers: SponsoredEntry[];
  sponsoringForOthers: SponsoringEntry[];
}
