import type { StellarNetwork } from "@/core/network/types";

export interface OfferLiabilityHeadroomInput {
  accountId: string;
}

export type AssetIdentity =
  | { kind: "native"; key: "native"; label: string }
  | { kind: "credit"; key: string; code: string; issuer: string; label: string };

export interface RationalPrice {
  numerator: string;
  denominator: string;
  display: string;
  approximate: string;
}

export interface BalanceLiabilityRow {
  asset: AssetIdentity;
  balance: string;
  sellingLiabilities: string;
  buyingLiabilities: string;
  limit: string | null;
  availableToSellEstimate: string | null;
}

export interface OfferRow {
  id: string;
  selling: AssetIdentity;
  buying: AssetIdentity;
  amount: string;
  price: RationalPrice;
  lastModifiedLedger: string | null;
  matchedBalance: boolean;
}

export interface OfferLiabilityHeadroomResult {
  network: StellarNetwork;
  accountId: string;
  accountLedger: string | null;
  offersLedger: string | null;
  ledgerSkew: boolean;
  offers: OfferRow[];
  liabilities: BalanceLiabilityRow[];
  unmatchedOfferCount: number;
  disclaimer: string;
}

export type OfferLiabilityHeadroomErrorCode =
  | "invalid_account"
  | "account_not_found"
  | "malformed_offer"
  | "inconsistent_snapshot"
  | "rate_limited"
  | "request_failed";
