import type { TradeAggregationViewerErrorCode } from "@/features/trade-aggregation-viewer/types";

export const copy = {
  formLabel: "Trade aggregation",
  formHint: 'JSON: {"base":"native","counter":{"code":"USDC","issuer":"G..."},"resolution":3600000,"offsetHours":0}',
  submit: "Load aggregations",
  working: "Loading",
  emptyTitle: "No aggregations loaded",
  emptyDescription: "Choose an asset pair, supported resolution and time range.",
  resultTitle: "Trade aggregations",
  base: "Base asset",
  counter: "Counter asset",
  resolution: "Resolution",
  requestedRange: "Requested range",
  usedRange: "Aligned range used",
  open: "Open (exact)",
  high: "High (exact)",
  low: "Low (exact)",
  close: "Close (exact)",
  baseVolume: "Base volume",
  counterVolume: "Counter volume",
  trades: "Trades",
  summary: "Summary",
  network: "Network",
  noTradesTitle: "No trading activity in this range",
  noTradesDescription: "The pair and time bounds are valid, but Horizon returned no aggregation buckets.",
  notAvailable: "n/a",
  summaryValue: (trades: number, base: string, counter: string) => `${trades} trades - ${base} base / ${counter} counter volume`
} as const;

export const errorCopy: Record<TradeAggregationViewerErrorCode, { title: string; description: string }> = {
  empty_base_asset: { title: "Enter a base asset", description: "Provide native or an issued asset with its code and issuer." },
  invalid_base_asset: { title: "The base asset is not valid", description: "Use native or a 1-12 character code with a valid G issuer address." },
  empty_counter_asset: { title: "Enter a counter asset", description: "Provide native or an issued asset with its code and issuer." },
  invalid_counter_asset: { title: "The counter asset is not valid", description: "Use native or a 1-12 character code with a valid G issuer address." },
  same_asset: { title: "Choose two different assets", description: "Base and counter assets must not be the same." },
  invalid_resolution: { title: "Choose a supported resolution", description: "Use 1m, 5m, 15m, 1h, 1d, 1w or 1mo in milliseconds." },
  invalid_offset: { title: "The offset is not valid", description: "Offsets are whole hours, apply only from the hourly resolution up, and must be smaller than the resolution." },
  no_trades: { title: "No trading activity in this range", description: "Try a wider range or another asset pair." },
  rate_limited: { title: "Horizon is rate limiting this request", description: "Wait a moment before loading aggregations again." },
  request_failed: { title: "Could not load aggregations", description: "Horizon did not return a usable aggregation response. Check the pair and retry." }
};
