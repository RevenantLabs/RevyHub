import type {
  Sep38QuoteViewerErrorCode,
  Sep38QuoteViewerField
} from "@/features/sep38-quote-viewer/types";

export const copy = {
  formName: "Indicative price request",
  homeDomainLabel: "Anchor home domain",
  homeDomainHint: "Hostname only, such as anchor.example. The tool fetches that host's stellar.toml over HTTPS.",
  offChainLabel: "Off-chain asset",
  offChainHint: "An ISO 4217 identifier such as iso4217:USD.",
  onChainLabel: "On-chain asset",
  onChainHint: "Use stellar:CODE:ISSUER or stellar:native. Paste a public issuer, never a secret key.",
  sellSideLabel: "Asset you would sell",
  sellSideHint: "The other asset is the one you would buy. This does not place an order.",
  sellOffChain: "Sell the off-chain asset",
  sellOnChain: "Sell the on-chain asset",
  amountLabel: "Sell amount",
  amountHint: "A positive decimal string such as 100 or 100.50. It is never parsed as a floating-point number.",
  submit: "Show indicative price",
  working: "Fetching indicative price",
  emptyTitle: "No indicative price yet",
  emptyDescription:
    "Enter an anchor domain plus one off-chain asset and one on-chain asset. The result is informational.",
  resultTitle: "Indicative SEP-38 price",
  summary: "Indicative price from the anchor public price endpoint.",
  loadingTitle: "Fetching the indicative price",
  loadingDescription:
    "Reading stellar.toml, then the public price endpoint. Nothing is signed and no firm quote is requested.",
  priceLabel: "Indicative price",
  sellAssetLabel: "Sell asset",
  buyAssetLabel: "Buy asset",
  sellAmountLabel: "Sell amount",
  buyAmountLabel: "Reported buy amount",
  feeLabel: "Reported fee",
  domainLabel: "Anchor home domain",
  quoteServerLabel: "Quote server",
  priceUrlLabel: "Price request",
  networkLabel: "Network context",
  expirationLabel: "Expiration",
  noExpiration: "The anchor did not return an expiration time.",
  indicativeTitle: "Indicative only",
  indicativeDescription:
    "This number comes from the public SEP-38 price endpoint. It is not a firm quote, it is not bindable, and this tool cannot execute it."
} as const;

export const errorCopy: Record<Sep38QuoteViewerErrorCode, { title: string; description: string }> = {
  invalid_home_domain: {
    title: "Enter a valid anchor home domain",
    description: "Use a hostname such as anchor.example, or an https URL with no path, port, or credentials."
  },
  missing_quote_server: {
    title: "This anchor does not publish a quote server",
    description:
      "SEP-38 prices require ANCHOR_QUOTE_SERVER in stellar.toml. Choose an anchor that advertises one."
  },
  unsupported_pair: {
    title: "This anchor does not price that pair",
    description:
      "The quote server answered, and this off-chain and on-chain pair is not supported. Try another pair or another anchor."
  },
  invalid_asset: {
    title: "Check both asset identifiers",
    description:
      "Off-chain assets look like iso4217:USD. On-chain assets look like stellar:CODE:ISSUER or stellar:native. Secret keys are rejected."
  },
  invalid_amount: {
    title: "Enter the sell amount as a decimal string",
    description: "Use a positive amount such as 25 or 25.50. Scientific notation and zero are not accepted."
  },
  request_failed: {
    title: "The indicative price could not be read",
    description:
      "The domain, stellar.toml, or price response failed in transit or could not be decoded. This is separate from an unsupported pair. Check the anchor and try again."
  }
};

export const fieldErrorCopy: Record<Sep38QuoteViewerField, string> = {
  home_domain: errorCopy.invalid_home_domain.description,
  off_chain: "Enter an off-chain asset such as iso4217:USD. Stellar assets do not belong in this field.",
  on_chain:
    "Enter stellar:CODE:ISSUER or stellar:native. The issuer must be a public address. Secret keys are discarded.",
  amount: errorCopy.invalid_amount.description,
  sell_side: "Choose whether you would sell the off-chain asset or the on-chain asset."
};
