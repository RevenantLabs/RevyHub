import { describe, expect, it } from "vitest"
import { ANCHOR_ID, FEE_ASSET_OTHER, quoteRecord } from "@/features/sep38-quote-expiry-auditor/fixtures/normal.fixture"
import { isZeroAmount, readQuoteTerms } from "@/features/sep38-quote-expiry-auditor/lib/quote-terms"

describe("readQuoteTerms", () => {
  it("keeps exact amount strings and a matching fee asset", () => {
    const result = readQuoteTerms(quoteRecord(), ANCHOR_ID)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.sellAmount).toBe("100.0000000")
    expect(result.value.feeCurrencyDiffers).toBe(false)
    expect(result.value.missingTerms).toEqual([])
  })

  it("rejects a zero amount without treating it as a missing term", () => {
    const result = readQuoteTerms(quoteRecord({ sell_amount: "0.0000000" }), ANCHOR_ID)
    expect(result).toEqual({ ok: false, code: "invalid_input" })
    expect(isZeroAmount("0.0000000")).toBe(true)
  })

  it("rejects a non-decimal amount", () => {
    const result = readQuoteTerms(quoteRecord({ buy_amount: "10.5.1" }), ANCHOR_ID)
    expect(result).toEqual({ ok: false, code: "malformed_data" })
  })

  it("reports a fee currency that is not the sold asset", () => {
    const result = readQuoteTerms(quoteRecord({ fee: { total: "1", asset: FEE_ASSET_OTHER } }), ANCHOR_ID)
    expect(result.ok && result.value.feeCurrencyDiffers).toBe(true)
    expect(result.ok && result.value.feeAsset).toBe(FEE_ASSET_OTHER)
  })

  it("lists missing fee terms instead of inventing zeroes", () => {
    const record: Record<string, unknown> = { ...quoteRecord() }
    delete record.fee
    delete record.price
    const result = readQuoteTerms(record, ANCHOR_ID)
    expect(result.ok && result.value.missingTerms).toEqual(["price", "fee.total", "fee.asset"])
    expect(result.ok && result.value.feeTotal).toBeNull()
  })

  it("refuses a quote that names a different anchor or the same asset on both sides", () => {
    expect(readQuoteTerms(quoteRecord({ anchor: "other-anchor" }), ANCHOR_ID).ok).toBe(false)
    expect(readQuoteTerms(quoteRecord({ buy_asset: quoteRecord().sell_asset }), ANCHOR_ID)).toMatchObject({
      code: "unsupported_variant"
    })
  })

  it("keeps unknown fields and refuses compare_to", () => {
    const kept = readQuoteTerms(quoteRecord({ route_note: "desk" }), ANCHOR_ID)
    expect(kept.ok && kept.value.unsupportedFields).toEqual(["route_note"])
    expect(readQuoteTerms(quoteRecord({ compare_to: { id: "other" } }), ANCHOR_ID)).toMatchObject({
      code: "unsupported_variant"
    })
  })
})
