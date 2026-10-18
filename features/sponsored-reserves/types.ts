export type SponsoredEntryKind = "account" | "trustline" | "signer" | "offer" | "data";

/** One ledger entry whose reserve is paid by another account. */
export interface SponsoredEntry {
  id: string;
  kind: SponsoredEntryKind;
  reference: string;
  sponsor: string;
}

export interface SponsoredReservesInput {
  accountId: string;
}

export interface SponsoredReservesResult {
  accountId: string;
  sponsoredEntries: SponsoredEntry[];
  /** Reserve units this account pays for on other accounts. */
  numSponsoring: number;
  /** Reserve units another account pays for on this account. */
  numSponsored: number;
  baseReserveStroops: string;
  /** Positive means reserve relief; negative means an added obligation. */
  netReserveEffectStroops: string;
}

export type SponsoredReservesErrorCode =
  | "empty_input"
  | "invalid_address"
  | "account_not_found"
  | "rate_limited"
  | "request_failed";
