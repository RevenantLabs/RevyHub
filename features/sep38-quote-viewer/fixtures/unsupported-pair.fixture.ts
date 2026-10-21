import type { Sep38QuoteViewerRawInput } from "@/features/sep38-quote-viewer/types";
import {
  HOME_DOMAIN,
  ON_CHAIN_ASSET
} from "@/features/sep38-quote-viewer/fixtures/sep38QuoteViewer.fixture";

/** A valid pair the anchor explicitly refuses. Distinct from a transport failure. */
export const UNSUPPORTED_OFF_CHAIN = "iso4217:ZAR";
export const UNSUPPORTED_AMOUNT = "10";
export const UNSUPPORTED_ERROR = "The anchor does not support this asset pair";

export const unsupportedPairRaw: Sep38QuoteViewerRawInput = {
  homeDomain: HOME_DOMAIN,
  offChainAsset: UNSUPPORTED_OFF_CHAIN,
  onChainAsset: ON_CHAIN_ASSET,
  sellSide: "off-chain",
  sellAmount: UNSUPPORTED_AMOUNT
};

export const unsupportedPriceBody = {
  error: UNSUPPORTED_ERROR
};
