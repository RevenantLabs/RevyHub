import { err, ok, type Result } from "@/core/result/result"
import { evaluateQuoteExpiry } from "@/features/sep38-quote-expiry-auditor/lib/quote-expiry"
import { readQuoteTerms } from "@/features/sep38-quote-expiry-auditor/lib/quote-terms"
import type { Sep38ErrorCode, Sep38Input, Sep38Result } from "@/features/sep38-quote-expiry-auditor/types"

export function runSep38QuoteExpiryAuditor(
  input: Sep38Input
): Result<Sep38Result, Sep38ErrorCode> {
  let parsed: unknown
  try {
    parsed = JSON.parse(input.quoteJson)
  } catch {
    return err("malformed_data")
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return err("malformed_data")
  }

  const quote = parsed as Record<string, unknown>
  const expiresAt = quote.expires_at
  if (typeof expiresAt !== "string" || !expiresAt) return err("malformed_data")

  const terms = readQuoteTerms(quote, input.anchorId)
  if (!terms.ok) return err(terms.code)

  const expiry = evaluateQuoteExpiry(expiresAt, input.evaluationTime)
  if (!expiry.ok) return err(expiry.code)

  return ok({
    anchorId: input.anchorId,
    terms: terms.value,
    expiry: expiry.value,
    completeness: terms.value.missingTerms.length === 0 ? "complete" : "incomplete"
  })
}
