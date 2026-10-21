import { errorCopy } from "@/features/sep38-quote-viewer/copy";
import {
  UNSUPPORTED_AMOUNT,
  UNSUPPORTED_OFF_CHAIN
} from "@/features/sep38-quote-viewer/fixtures/unsupported-pair.fixture";
import {
  HOME_DOMAIN,
  ON_CHAIN_ASSET
} from "@/features/sep38-quote-viewer/fixtures/sep38QuoteViewer.fixture";

/**
 * The anchor answers, but it does not price this pair.
 * The screen must show the unsupported-pair message, not the transport failure.
 */
export const spec = {
  route: "/tools/sep38-quote-viewer",
  viewport: { width: 390, height: 844 },
  steps: [
    { action: "visit", target: "/tools/sep38-quote-viewer" },
    { action: "fill", target: "Anchor home domain", value: HOME_DOMAIN },
    { action: "fill", target: "Off-chain asset", value: UNSUPPORTED_OFF_CHAIN },
    { action: "fill", target: "On-chain asset", value: ON_CHAIN_ASSET },
    { action: "fill", target: "Sell amount", value: UNSUPPORTED_AMOUNT },
    { action: "click", target: "Show indicative price" },
    { action: "expect", target: "alert", value: errorCopy.unsupported_pair.title },
    { action: "expect-absent", target: "text", value: errorCopy.request_failed.title },
    { action: "expect-absent", target: "text", value: "Indicative SEP-38 price" }
  ]
} as const;
