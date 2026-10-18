import type { StellarNetwork } from "@/core/network/types";

export type TradeAggregationAsset =
  | { type: "native" }
  | { type: "credit"; code: string; issuer: string };

export interface TradeAggregationViewerInput {
  value?: string;
  base?: TradeAggregationAsset;
  counter?: TradeAggregationAsset;
  resolution?: number;
  startTime?: string;
  endTime?: string;
  offsetHours?: number;
}

export interface ExactPrice {
  numerator: string;
  denominator: string;
  display: string;
}

export interface TradeAggregationBucket {
  timestamp: string;
  start: string;
  end: string;
  open: string;
  high: string;
  low: string;
  close: string;
  openFraction: ExactPrice;
  highFraction: ExactPrice;
  lowFraction: ExactPrice;
  closeFraction: ExactPrice;
  baseVolume: string;
  counterVolume: string;
  tradeCount: number;
}

export interface TradeAggregationViewerResult {
  base: TradeAggregationAsset;
  counter: TradeAggregationAsset;
  resolution: number;
  offsetHours: number;
  requestedStart?: string;
  requestedEnd?: string;
  usedStart: string;
  usedEnd: string;
  buckets: TradeAggregationBucket[];
  totalBaseVolume: string;
  totalCounterVolume: string;
  totalTrades: number;
  /** True when a valid range contained no aggregated trades. */
  noTrades: boolean;
  network: StellarNetwork;
}

export type TradeAggregationViewerErrorCode =
  | "empty_base_asset"
  | "invalid_base_asset"
  | "empty_counter_asset"
  | "invalid_counter_asset"
  | "same_asset"
  | "invalid_resolution"
  | "invalid_offset"
  | "no_trades"
  | "rate_limited"
  | "request_failed";

export type TradeAggregationViewerField = "base" | "counter" | "resolution" | "offset";
