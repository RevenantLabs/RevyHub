import type { QuoteExpiry, QuoteTerms } from "@/features/sep38-quote-expiry-auditor/types"

/** Amounts are shown exactly as quoted. Nothing is rounded or parsed as a float. */
export function formatAmount(amount: string | null): string {
  return amount === null ? "not declared" : amount
}

export function formatIdentifier(value: string | null): string {
  return value === null ? "not declared" : value
}

export function formatExpiry(expiry: QuoteExpiry): string {
  const relation =
    expiry.boundary === "before"
      ? "evaluation is before expiry"
      : expiry.boundary === "exact"
        ? "evaluation is the exact expiry instant"
        : "evaluation is after expiry"
  return `${expiry.status} (${relation}); expires ${expiry.expiresAt}; evaluated ${expiry.evaluationTime}; epoch ${expiry.expiresAtEpochMs}`
}

export function formatMissingTerms(terms: QuoteTerms): string {
  return terms.missingTerms.length === 0 ? "none" : terms.missingTerms.join(", ")
}
