import type { Sep38QuoteViewerRawInput } from "@/features/sep38-quote-viewer/types";
import { HOME_DOMAIN } from "@/features/sep38-quote-viewer/fixtures/sep38QuoteViewer.fixture";

/** Edge case: native asset, a 22-digit amount, and no expiration. */
export const SUPPORTED_OFF_CHAIN = "iso4217:EUR";
export const SUPPORTED_ON_CHAIN = "stellar:native";
export const SUPPORTED_AMOUNT = "1000000000000000000000";
export const SUPPORTED_PRICE = "0.0000001";

export const supportedPairRaw: Sep38QuoteViewerRawInput = {
  homeDomain: `https://${HOME_DOMAIN}`,
  offChainAsset: SUPPORTED_OFF_CHAIN,
  onChainAsset: SUPPORTED_ON_CHAIN,
  sellSide: "on-chain",
  sellAmount: SUPPORTED_AMOUNT
};

export const supportedPriceBody = {
  price: SUPPORTED_PRICE,
  sell_amount: SUPPORTED_AMOUNT
};
