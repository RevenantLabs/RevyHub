import { describe, expect, it } from "vitest"
import { formatAmount, formatExpiry, formatIdentifier } from "@/features/sep38-quote-expiry-auditor/lib/format"
import type { QuoteExpiry } from "@/features/sep38-quote-expiry-auditor/types"

const expiry: QuoteExpiry = {
  expiresAt: "2026-06-01T13:00:00.000Z",
  evaluationTime: "2026-06-01T12:00:00.000Z",
  expiresAtEpochMs: "1780311600000",
  evaluationEpochMs: "1780308000000",
  status: "active",
  boundary: "before"
}

describe("SEP-38 formatting", () => {
  it("does not round or shorten amount strings", () => {
    expect(formatAmount("100.0000000")).toBe("100.0000000")
    expect(formatAmount(null)).toBe("not declared")
  })

  it("shows identifiers unchanged", () => {
    expect(formatIdentifier("stellar:USDC:GISSUER")).toBe("stellar:USDC:GISSUER")
  })

  it("includes the original timestamps in the expiry line", () => {
    expect(formatExpiry(expiry)).toContain("2026-06-01T13:00:00.000Z")
    expect(formatExpiry(expiry)).toContain("active")
  })
})
