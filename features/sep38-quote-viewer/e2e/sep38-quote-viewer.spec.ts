import { copy } from "@/features/sep38-quote-viewer/copy";
import { manifest } from "@/features/sep38-quote-viewer/manifest";
import {
  EXPIRES_AT,
  HOME_DOMAIN,
  INDICATIVE_PRICE,
  OFF_CHAIN_ASSET,
  ON_CHAIN_ASSET,
  SELL_AMOUNT
} from "@/features/sep38-quote-viewer/fixtures/sep38QuoteViewer.fixture";

/**
 * Main browser journey: a supported off-chain and on-chain pair.
 * The screen must show the price, both assets, expiration, and the indicative label.
 */
export const spec = {
  route: "/tools/sep38-quote-viewer",
  viewport: { width: 390, height: 844 },
  steps: [
    { action: "visit", target: "/tools/sep38-quote-viewer" },
    { action: "expect", target: "heading", value: manifest.title },
    { action: "expect", target: "text", value: copy.emptyTitle },
    { action: "fill", target: copy.homeDomainLabel, value: HOME_DOMAIN },
    { action: "fill", target: copy.offChainLabel, value: OFF_CHAIN_ASSET },
    { action: "fill", target: copy.onChainLabel, value: ON_CHAIN_ASSET },
    { action: "fill", target: copy.amountLabel, value: SELL_AMOUNT },
    { action: "click", target: copy.submit },
    { action: "expect", target: "text", value: copy.indicativeTitle },
    { action: "expect", target: "text", value: INDICATIVE_PRICE },
    { action: "expect", target: "text", value: OFF_CHAIN_ASSET },
    { action: "expect", target: "text", value: ON_CHAIN_ASSET },
    { action: "expect", target: "text", value: EXPIRES_AT.slice(0, 10) },
    { action: "expect", target: "layout", value: "single-column-at-390" }
  ]
} as const;
