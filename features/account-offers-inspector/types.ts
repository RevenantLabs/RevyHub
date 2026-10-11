export interface OfferEntry {
  id: string;
  seller: string;
  sellingAsset: string;
  buyingAsset: string;
  amount: string;
  price: string;
  priceN: number;
  priceD: number;
  lastModifiedLedger: number;
  lastModifiedTime: string;
}

export interface AccountOffersResult {
  accountId: string;
  offers: OfferEntry[];
  network: string;
}

export type AccountOffersErrorCode =
  | "empty_input"
  | "invalid_address"
  | "account_not_found"
  | "rate_limited"
  | "request_failed";
