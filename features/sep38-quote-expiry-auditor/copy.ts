import type { Sep38ErrorCode } from "@/features/sep38-quote-expiry-auditor/types"

export const copy = {
  anchorLabel: "Anchor identifier",
  anchorHint: "The anchor this quote belongs to. A secret seed is refused and never shown.",
  evaluationLabel: "Evaluation time",
  evaluationHint: "ISO-8601 instant to judge the quote against, including a timezone offset.",
  quoteLabel: "SEP-38 quote JSON",
  quoteHint: "Paste one recorded firm quote. This tool does not request or accept a quote.",
  submit: "Audit quote",
  working: "Auditing quote",
  emptyTitle: "No quote audited yet",
  emptyDescription:
    "Paste one SEP-38 firm quote, the anchor it belongs to, and the instant you want expiry judged against.",
  resultTitle: "Quote terms",
  expiryTitle: "Expiry",
  incompleteTitle: "Terms are incomplete",
  incompleteDescription: "Required identity and amounts are present. Fields listed as not declared were absent from the quote.",
  feeDiffers: "Fee asset differs from the sold asset",
  unsupportedTitle: "Unsupported fields kept as evidence"
} as const

export const errorCopy: Record<Sep38ErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "The quote, anchor, and evaluation time are all required",
    description: "Fill every field. An empty quote is not the same as a quote that is missing a fee."
  },
  invalid_input: {
    title: "That input cannot be audited",
    description: "Remove any secret seed, and use a non-zero decimal amount such as 100.0000000."
  },
  malformed_data: {
    title: "The quote JSON or a timestamp could not be read",
    description: "Paste one JSON object with id, assets, decimal amount strings, and an ISO-8601 expires_at."
  },
  unsupported_variant: {
    title: "This quote cannot be compared",
    description: "Use one quote for this anchor. Cross-anchor, same-asset, and compare_to payloads are refused."
  },
  too_large: {
    title: "The pasted quote is too large",
    description: "Paste a single firm-quote response under 20,000 characters."
  }
}
