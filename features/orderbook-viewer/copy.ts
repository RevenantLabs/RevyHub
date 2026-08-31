import type { OrderbookViewerErrorCode } from "@/features/orderbook-viewer/types";

export const copy = {
  formLabel: "Order book pair",
  formHint: 'JSON: {"selling":"native","buying":{"code":"USDC","issuer":"G..."},"limit":20}',
  submit: "View book",
  working: "Loading",
  emptyTitle: "No order book loaded",
  emptyDescription: "Enter the selling and buying assets to inspect public DEX liquidity.",
  resultTitle: "Order book",
  bidsTitle: "Bids",
  asksTitle: "Asks",
  bestBid: "Best bid",
  bestAsk: "Best ask",
  spread: "Spread",
  spreadPercent: "Spread percent",
  midPrice: "Mid-price",
  imbalance: "Top-five imbalance",
  network: "Network",
  selling: "Selling asset",
  buying: "Buying asset",
  price: "Price (exact)",
  amount: "Amount",
  cumulative: "Cumulative",
  noLiquidityTitle: "No liquidity for this pair",
  noLiquidityDescription: "Horizon returned no offers on one or both sides of this pair.",
  notAvailable: "n/a"
} as const;

export const errorCopy: Record<OrderbookViewerErrorCode, { title: string; description: string }> = {
  empty_selling_asset: { title: "Enter a selling asset", description: "Provide native or an issued asset with its code and issuer." },
  invalid_selling_asset: { title: "The selling asset is not valid", description: "Use native or a 1-12 character code with a valid G issuer address." },
  empty_buying_asset: { title: "Enter a buying asset", description: "Provide native or an issued asset with its code and issuer." },
  invalid_buying_asset: { title: "The buying asset is not valid", description: "Use native or a 1-12 character code with a valid G issuer address." },
  same_asset: { title: "Choose two different assets", description: "Selling and buying assets must not be the same." },
  empty_orderbook: { title: "No liquidity for this pair", description: "Try another pair or network." },
  rate_limited: { title: "Horizon is rate limiting this request", description: "Wait a moment before loading the order book again." },
  request_failed: { title: "Could not load the order book", description: "Horizon did not return a usable order book. Check the pair and retry." }
};
