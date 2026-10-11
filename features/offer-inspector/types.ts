import type { StellarNetwork } from "@/core/network/types";

export type OfferInspectorErrorCode =
  | "empty_input"
  | "invalid_address"
  | "account_not_found"
  | "rate_limited"
  | "request_failed";

export type OfferInspectorField = "accountId";

export interface OfferAssetInfo {
  isNative: boolean;
  code: string;
  issuer?: string;
  label: string;
}

export interface DisplayOffer {
  id: string;
  pagingToken: string;
  seller: string;
  selling: OfferAssetInfo;
  buying: OfferAssetInfo;
  amount: string;
  price: string;
  priceFraction: {
    n: number;
    d: number;
  };
  lastModifiedLedger: number;
  lastModifiedTime: string;
  sponsor?: string;
}

export interface OfferInspectorResult {
  accountId: string;
  offers: DisplayOffer[];
  latestLedgerSequence: number;
  baseReserveInStroops: number;
  baseReserveXlm: string;
  loadedOffersCount: number;
  grossReserveUnits: number;
  grossReserveStroops: string;
  grossReserveXlm: string;
  isPartial: boolean;
  nextCursor?: string;
  network: StellarNetwork;
}

export interface OfferInspectorInput {
  accountId: string;
  cursor?: string;
  limit?: number;
}

