import type { AnchorDiscoveryErrorCode } from "@/features/anchor-discovery/types";

export const copy = {
  formLabel: "Anchor domain",
  formHint: "Enter a domain or https URL. Only /.well-known/stellar.toml is fetched.",
  submit: "Discover endpoints",
  emptyTitle: "No anchor discovered",
  emptyDescription: "Enter an anchor domain to inspect SEP-6, SEP-10, SEP-12, SEP-24, SEP-31 and SEP-38 metadata.",
  resultTitle: "Anchor endpoint discovery"
} as const;

export const errorCopy: Record<AnchorDiscoveryErrorCode, { title: string; description: string }> = {
  empty_input: { title: "Enter an anchor domain", description: "Provide the HTTPS domain that publishes the anchor metadata." },
  invalid_domain: { title: "That domain is not valid", description: "Use a hostname such as anchor.example without credentials or a path." },
  insecure_domain: { title: "HTTPS is required", description: "Anchor metadata is fetched only over HTTPS." },
  toml_unreachable: { title: "stellar.toml could not be reached", description: "Check the domain and try again; redirects and non-HTTPS endpoints are refused." },
  toml_invalid: { title: "stellar.toml is invalid", description: "The response must be a small, valid TOML document." },
  no_services: { title: "No supported services declared", description: "The document does not advertise a SEP-6, SEP-10, SEP-12, SEP-24, SEP-31 or SEP-38 endpoint." },
  request_failed: { title: "Discovery did not complete", description: "Check the domain response and try again." }
};
