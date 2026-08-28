import type { AssetMetadataErrorCode } from "@/features/asset-metadata/types";

export const copy = {
  formLabel: "Issuer domain",
  formHint:
    "A domain such as example.com. Only HTTPS is used, and only the /.well-known/stellar.toml path is requested.",
  submit: "Read stellar.toml",
  loading: "Fetching...",
  emptyTitle: "No domain read yet",
  emptyDescription:
    "Enter a domain to see the assets it declares in its stellar.toml under SEP-0001.",
  resultTitle: "Declared assets",
  provenanceTitle: "Where this came from",
  noCurrenciesTitle: "This domain declares no assets",
  noCurrenciesDescription:
    "The stellar.toml was fetched and parsed successfully, but it contains no [[CURRENCIES]] entries.",
  trustWarningTitle: "This is what the domain claims about itself",
  trustWarningDescription:
    "SEP-0001 metadata is published by the issuer. It is a self-description, not a verified fact, and this tool renders every field as plain text without following any URL it declares.",
  unpinnedLabel: "no issuer declared",
  labelFetchUrl: "URL fetched",
  labelFetchedAt: "Read at",
  labelCount: "Assets declared"
} as const;

export const errorCopy: Record<
  AssetMetadataErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter a domain",
    description: "For example example.com, or the issuer's home domain."
  },
  insecure_scheme: {
    title: "Only HTTPS is accepted",
    description:
      "stellar.toml is fetched over HTTPS only. A plaintext response could be modified in transit, and asset metadata is exactly the sort of thing worth modifying."
  },
  invalid_domain: {
    title: "That is not a valid domain",
    description:
      "Enter a DNS hostname such as example.com. Bare IP addresses and URLs containing credentials are refused."
  },
  toml_not_found: {
    title: "That domain publishes no stellar.toml",
    description:
      "There is nothing at /.well-known/stellar.toml. The domain may not publish SEP-0001 metadata at all."
  },
  redirect_refused: {
    title: "The server tried to redirect the request",
    description:
      "Redirects are not followed. SEP-0001 metadata only means something when it comes from the domain you asked about, and a redirect moves the request to a host you did not name."
  },
  response_too_large: {
    title: "The response is too large",
    description:
      "A stellar.toml is a few kilobytes. Anything over 100 KiB is not one, and is not parsed."
  },
  toml_malformed: {
    title: "The stellar.toml could not be parsed",
    description: "The file was fetched but its CURRENCIES section is not well-formed TOML."
  },
  timeout: {
    title: "The request timed out",
    description: "The domain did not answer within ten seconds."
  },
  network_error: {
    title: "Could not reach that domain",
    description:
      "The request never completed. The domain may not exist, may be offline, or may not send the CORS headers a browser needs — a browser cannot tell these apart."
  },
  server_error: {
    title: "The server returned an error",
    description: "The domain is reachable but did not serve the file."
  }
};
