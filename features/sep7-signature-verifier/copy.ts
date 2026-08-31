import type { Sep7SignatureVerifierErrorCode } from "@/features/sep7-signature-verifier/types";

export const copy = {
  formLabel: "SEP-0007 payment request URI",
  formHint: "Paste a web+stellar URI containing origin_domain and signature.",
  formPlaceholder: "web+stellar:pay?destination=...",
  submit: "Verify signature",
  loading: "Verifying...",
  emptyTitle: "No URI verified yet",
  emptyDescription: "Enter a signed SEP-0007 URI to check whether its declared domain signed the request.",
  resultTitle: "Signature verified",
  verifiedDescription: "The domain signed this request. This says nothing about whether paying it is wise.",
  labelOrigin: "Origin domain",
  labelSigningKey: "Signing key",
  labelToml: "stellar.toml"
} as const;

export const errorCopy: Record<Sep7SignatureVerifierErrorCode, { title: string; description: string }> = {
  empty_input: { title: "Enter a URI first", description: "Paste a SEP-0007 web+stellar payment request." },
  wrong_scheme: { title: "That is not a web+stellar URI", description: "Use a URI beginning with web+stellar:." },
  no_signature: { title: "This URI has no signature", description: "Use a request that includes a signature query parameter." },
  no_origin_domain: { title: "No valid origin domain", description: "The URI must include a fully qualified origin_domain such as example.com." },
  toml_unreachable: { title: "Could not reach the domain's stellar.toml", description: "Check the domain and try again; its signing key could not be fetched." },
  no_signing_key: { title: "The request is unverifiable", description: "The domain publishes no URI_REQUEST_SIGNING_KEY. Ask it to add one to stellar.toml." },
  invalid_signing_key: { title: "The domain's signing key is invalid", description: "Do not trust this request until the domain publishes a valid Stellar public key." },
  signature_invalid: { title: "The signature is invalid", description: "The domain's key did not verify this exact URI. Do not sign or pay it." },
  request_failed: {
    title: "The request did not complete",
    description: "Try again. A network or transport error prevented verification."
  }
};
