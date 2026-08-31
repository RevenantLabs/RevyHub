import type { StellarNetwork } from "@/core/network/types";

export type OrderbookAsset =
  | { type: "native" }
  | { type: "credit"; code: string; issuer: string };

export interface OrderbookViewerInput {
  value?: string;
  selling?: OrderbookAsset;
  buying?: OrderbookAsset;
  limit?: number;
}

export interface OrderbookLevel {
  /** Exact Horizon price_r fraction, reduced for display. */
  price: string;
  priceNumerator: string;
  priceDenominator: string;
  /** Rounded only for optional human context; calculations use price_r. */
  priceDecimal: string;
  amount: string;
  total: string;
}

export interface OrderbookViewerResult {
  selling: OrderbookAsset;
  buying: OrderbookAsset;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  bestBid: string;
  bestAsk: string;
  spread: string;
  spreadPercent: string;
  midPrice: string;
  imbalancePercent: string;
  empty: boolean;
  emptyReason?: string;
  network: StellarNetwork;
}

export type OrderbookViewerErrorCode =
  | "empty_selling_asset"
  | "invalid_selling_asset"
  | "empty_buying_asset"
  | "invalid_buying_asset"
  | "same_asset"
  | "empty_orderbook"
  | "rate_limited"
  | "request_failed";

export type OrderbookViewerField = "selling" | "buying";
