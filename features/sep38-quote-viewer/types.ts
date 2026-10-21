import type { StellarNetwork } from "@/core/network/types";

/** Which validated input a field-level error belongs to. */
export type Sep38QuoteViewerField =
  | "home_domain"
  | "off_chain"
  | "on_chain"
  | "amount"
  | "sell_side";

export type Sep38SellSide = "off-chain" | "on-chain";

export type Sep38QuoteViewerErrorCode =
  | "invalid_home_domain"
  | "missing_quote_server"
  | "unsupported_pair"
  | "invalid_asset"
  | "invalid_amount"
  | "request_failed";

/** Form values before validation. Amounts stay strings. */
export interface Sep38QuoteViewerRawInput {
  homeDomain: string;
  offChainAsset: string;
  onChainAsset: string;
  sellSide: string;
  sellAmount: string;
}

export interface OffChainAsset {
  kind: "off-chain";
  scheme: "iso4217";
  code: string;
  canonical: string;
}

export interface OnChainAsset {
  kind: "on-chain";
  scheme: "stellar";
  code: string;
  issuer?: string;
  native: boolean;
  canonical: string;
}

export interface Sep38QuoteViewerInput {
  homeDomain: string;
  offChain: OffChainAsset;
  onChain: OnChainAsset;
  sellSide: Sep38SellSide;
  sellAmount: string;
  sellAsset: string;
  buyAsset: string;
}

/** Public indicative price. Every amount is the anchor's decimal string. */
export interface IndicativePrice {
  price: string;
  sellAmount?: string;
  buyAmount?: string;
  expiresAt?: string;
  feeTotal?: string;
  feeAsset?: string;
}

export interface Sep38QuoteViewerResult {
  summary: string;
  homeDomain: string;
  tomlUrl: string;
  quoteServer: string;
  priceUrl: string;
  sellAsset: string;
  buyAsset: string;
  offChain: OffChainAsset;
  onChain: OnChainAsset;
  sellSide: Sep38SellSide;
  sellAmount: string;
  quote: IndicativePrice;
  network: StellarNetwork;
  /** Always true. This slice never requests a firm quote. */
  indicativeOnly: true;
}
