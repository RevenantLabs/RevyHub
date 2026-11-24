import type { ParityErrorCode } from "@/features/cross-network-asset-parity-report/types"

export const copy = {
  pairsLabel: "Asset pairs JSON",
  pairsHint: "Up to 10 pairs. Each side needs a network, an asset code, and an issuer. Codes are never matched on their own.",
  submit: "Compare metadata",
  working: "Reading Horizon",
  emptyTitle: "No asset pairs compared yet",
  emptyDescription: "Paste the pairs you want compared. This report does not look up prices or guess issuers.",
  resultTitle: "Metadata parity",
  partialTitle: "This report is partial",
  partialDescription: "A side was missing or a field was not in the Horizon record. Those cells stay unavailable."
} as const

export const errorCopy: Record<ParityErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Add at least one pair",
    description: "Paste a JSON array. An empty array is not a report."
  },
  invalid_input: {
    title: "A pair is missing its network, code, or issuer",
    description: "Each side needs all three. Duplicate pair ids are refused, and a secret seed is not stored."
  },
  malformed_data: {
    title: "The pairs JSON could not be read",
    description: "Paste one JSON array of pair objects."
  },
  unsupported_variant: {
    title: "Native XLM has no issuer to compare",
    description: "Compare issued assets. This report does not map native lumens."
  },
  too_large: {
    title: "That list is too large",
    description: "Compare at most 10 pairs, in under 20,000 characters."
  },
  not_found: {
    title: "Horizon has no record for that request",
    description: "Check the issuer and the network. A missing asset inside a larger report stays as a partial row."
  },
  rate_limited: {
    title: "Horizon rate limited every side",
    description: "Wait and try the same pairs again. No prices were requested."
  },
  request_failed: {
    title: "Horizon could not be read",
    description: "The networks did not return account records. Try again when Horizon answers."
  }
}
