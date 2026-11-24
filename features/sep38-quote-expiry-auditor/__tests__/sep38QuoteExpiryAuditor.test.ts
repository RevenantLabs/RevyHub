import { describe, expect, it } from "vitest"
import { exactExpiryQuote, missingFeeQuote, otherFeeCurrencyQuote } from "@/features/sep38-quote-expiry-auditor/fixtures/boundary.fixture"
import { ANCHOR_ID, EVALUATION_TIME, quoteJson } from "@/features/sep38-quote-expiry-auditor/fixtures/normal.fixture"
import { runSep38QuoteExpiryAuditor } from "@/features/sep38-quote-expiry-auditor/lib/sep38QuoteExpiryAuditor"

function run(quote: string, evaluationTime = EVALUATION_TIME) {
  return runSep38QuoteExpiryAuditor({ anchorId: ANCHOR_ID, evaluationTime, quoteJson: quote })
}

describe("runSep38QuoteExpiryAuditor", () => {
  it("audits a complete active quote", () => {
    const result = run(quoteJson())
    expect(result.ok && result.value.completeness).toBe("complete")
    expect(result.ok && result.value.expiry.status).toBe("active")
    expect(result.ok && result.value.terms.sellAmount).toBe("100.0000000")
  })

  it("marks the exact expiry boundary expired", () => {
    const result = run(exactExpiryQuote)
    expect(result.ok && result.value.expiry.status).toBe("expired")
  })

  it("keeps a different fee currency as evidence", () => {
    const result = run(otherFeeCurrencyQuote)
    expect(result.ok && result.value.terms.feeCurrencyDiffers).toBe(true)
  })

  it("returns an incomplete result when fee and price are absent", () => {
    const result = run(missingFeeQuote)
    expect(result.ok && result.value.completeness).toBe("incomplete")
    expect(result.ok && result.value.terms.feeTotal).toBeNull()
  })

  it("rejects malformed JSON", () => {
    expect(run("{")).toEqual({ ok: false, code: "malformed_data" })
  })
})
