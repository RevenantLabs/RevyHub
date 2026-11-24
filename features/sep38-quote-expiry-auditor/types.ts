export type Sep38ErrorCode =
  | "empty_input"
  | "invalid_input"
  | "malformed_data"
  | "unsupported_variant"
  | "too_large"

export type ExpiryBoundary = "before" | "exact" | "after"

export type Completeness = "complete" | "incomplete"

export interface Sep38Input {
  anchorId: string
  evaluationTime: string
  quoteJson: string
}

export interface QuoteTerms {
  id: string
  sellAsset: string
  buyAsset: string
  sellAmount: string
  buyAmount: string
  price: string | null
  feeTotal: string | null
  feeAsset: string | null
  feeCurrencyDiffers: boolean
  unsupportedFields: string[]
  missingTerms: string[]
}

export interface QuoteExpiry {
  expiresAt: string
  evaluationTime: string
  expiresAtEpochMs: string
  evaluationEpochMs: string
  status: "active" | "expired"
  boundary: ExpiryBoundary
}

export interface Sep38Result {
  anchorId: string
  terms: QuoteTerms
  expiry: QuoteExpiry
  completeness: Completeness
}
