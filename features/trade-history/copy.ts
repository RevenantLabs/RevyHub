import type { TradeHistoryErrorCode } from "@/features/trade-history/types";

export const copy = {
  formLabel: "Trade filter",
  formHint: 'JSON: {"base":"native","counter":{"code":"USDC","issuer":"G..."},"limit":25} or {"account":"G..."}',
  submit: "Load trades",
  working: "Loading",
  emptyTitle: "No trade history loaded",
  emptyDescription: "Filter executed trades by an asset pair, account, or both.",
  resultTitle: "Trade history",
  filter: "Filter",
  pair: "Pair",
  account: "Account",
  timestamp: "Ledger close",
  baseSide: "Base side",
  counterSide: "Counter side",
  price: "Execution price (exact)",
  kind: "Liquidity source",
  orderbook: "Order book",
  liquidityPool: "Liquidity pool",
  offer: "Offer",
  pool: "Pool",
  summary: "Page",
  summaryValue: (page: number, total: number) => `Page ${page} - ${total} trades`,
  network: "Network",
  previous: "Previous page",
  next: "Next page",
  noTradesTitle: "No trades matched this filter",
  noTradesDescription: "Try another pair, account, network or a wider cursor range.",
  notAvailable: "n/a"
} as const;

export const errorCopy: Record<TradeHistoryErrorCode, { title: string; description: string }> = {
  empty_filter: { title: "Enter a trade filter", description: "Provide an asset pair, an account address, or both." },
  invalid_asset: { title: "The asset filter is not valid", description: "Use native or a 1-12 character code with a valid G issuer address." },
  invalid_address: { title: "The account address is not valid", description: "Use a Stellar public address starting with G; secret seeds are not accepted." },
  no_trades: { title: "No trades matched this filter", description: "Try another pair, account or network." },
  rate_limited: { title: "Horizon is rate limiting this request", description: "Wait a moment before loading trade history again." },
  request_failed: { title: "Could not load trade history", description: "Horizon did not return a usable trade collection. Check the filter and retry." }
};
