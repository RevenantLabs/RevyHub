import { EVALUATION_TIME, quoteJson } from "@/features/sep38-quote-expiry-auditor/fixtures/normal.fixture"

export const exactExpiryQuote = quoteJson({ expires_at: EVALUATION_TIME })
export const futureQuote = quoteJson({ expires_at: "2026-12-01T00:00:00.000Z" })
export const zeroAmountQuote = quoteJson({ sell_amount: "0" })
export const invalidAmountQuote = quoteJson({ buy_amount: "1e2" })
export const missingFeeQuote = quoteJson({ fee: undefined, price: undefined })
export const otherFeeCurrencyQuote = quoteJson({
  fee: { total: "1.0000000", asset: "iso4217:EUR" }
})
