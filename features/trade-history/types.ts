import type { StellarNetwork } from "@/core/network/types";

export type TradeHistoryAsset =
  | { type: "native" }
  | { type: "credit"; code: string; issuer: string };

export interface TradeHistoryInput {
  value?: string;
  base?: TradeHistoryAsset;
  counter?: TradeHistoryAsset;
  account?: string;
  cursor?: string;
  limit?: number;
}

export interface ExactTradePrice {
  numerator: string;
  denominator: string;
  display: string;
}

export interface TradeHistorySide {
  account: string;
  asset: TradeHistoryAsset;
  amount: string;
}

export interface TradeHistoryRecord {
  id: string;
  pagingToken: string;
  ledgerCloseTime: string;
  base: TradeHistorySide;
  counter: TradeHistorySide;
  baseIsSeller: boolean;
  executionPrice: ExactTradePrice;
  /** Exact fraction display alias for executionPrice. */
  price: string;
  /** Decimal source retained only for human comparison. */
  priceDecimal?: string;
  kind: "orderbook" | "liquidity_pool";
  liquidityPoolId?: string;
  offerId?: string;
  /** Legacy convenience fields used by compact consumers. */
  timestamp: string;
  side: "buy" | "sell";
  baseAsset: string;
  quoteAsset: string;
  amount: string;
  fee?: string;
  transactionHash?: string;
}

export interface TradeHistoryResult {
  records: TradeHistoryRecord[];
  total: number;
  page: number;
  pageSize: number;
  limit: number;
  filterMode: "pair" | "account" | "pair+account";
  base?: TradeHistoryAsset;
  counter?: TradeHistoryAsset;
  account?: string;
  cursor?: string;
  nextCursor?: string;
  previousCursor?: string;
  hasNext: boolean;
  hasPrevious: boolean;
  noTrades: boolean;
  network: StellarNetwork;
}

export type TradeHistoryErrorCode =
  | "empty_filter"
  | "invalid_asset"
  | "invalid_address"
  | "no_trades"
  | "rate_limited"
  | "request_failed";

export type TradeHistoryField = "base" | "counter" | "account";
