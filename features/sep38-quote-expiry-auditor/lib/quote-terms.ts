import { err, ok, type Result } from "@/core/result/result"
import type { QuoteTerms, Sep38ErrorCode } from "@/features/sep38-quote-expiry-auditor/types"

const AMOUNT = /^(0|[1-9][0-9]*)(\.[0-9]+)?$/
const KNOWN = new Set([
  "id",
  "expires_at",
  "sell_asset",
  "buy_asset",
  "sell_amount",
  "buy_amount",
  "price",
  "fee",
  "total_price"
])

export function isExactAmount(value: string): boolean {
  return AMOUNT.test(value)
}

export function isZeroAmount(value: string): boolean {
  return /^0+(?:\.0+)?$/.test(value)
}

function readAmount(value: unknown): string | null {
  return typeof value === "string" ? value : null
}

/**
 * Normalizes one firm quote. Amounts stay strings. A zero or non-decimal
 * amount is rejected. A fee denominated in another asset stays visible.
 */
export function readQuoteTerms(
  quote: Record<string, unknown>,
  anchorId: string
): Result<QuoteTerms, Sep38ErrorCode> {
  if ("compare_to" in quote || Array.isArray(quote.quotes)) return err("unsupported_variant")

  const quotedAnchor = quote.anchor ?? quote.anchor_account
  if (typeof quotedAnchor === "string" && quotedAnchor !== anchorId) return err("unsupported_variant")

  const id = typeof quote.id === "string" ? quote.id : ""
  const sellAsset = typeof quote.sell_asset === "string" ? quote.sell_asset : ""
  const buyAsset = typeof quote.buy_asset === "string" ? quote.buy_asset : ""
  const sellAmount = readAmount(quote.sell_amount)
  const buyAmount = readAmount(quote.buy_amount)

  if (!id || !sellAsset || !buyAsset || sellAmount === null || buyAmount === null) {
    return err("malformed_data")
  }
  if (sellAsset === buyAsset) return err("unsupported_variant")

  for (const amount of [sellAmount, buyAmount]) {
    if (!isExactAmount(amount)) return err("malformed_data")
    if (isZeroAmount(amount)) return err("invalid_input")
  }

  const price = readAmount(quote.price)
  if (price !== null && !isExactAmount(price)) return err("malformed_data")

  const fee = quote.fee
  let feeTotal: string | null = null
  let feeAsset: string | null = null
  if (fee !== undefined && fee !== null) {
    if (typeof fee !== "object" || Array.isArray(fee)) return err("malformed_data")
    const feeRecord = fee as Record<string, unknown>
    feeTotal = readAmount(feeRecord.total)
    feeAsset = typeof feeRecord.asset === "string" ? feeRecord.asset : null
    if (feeTotal !== null && !isExactAmount(feeTotal)) return err("malformed_data")
  }

  const missingTerms: string[] = []
  if (price === null) missingTerms.push("price")
  if (feeTotal === null) missingTerms.push("fee.total")
  if (feeAsset === null) missingTerms.push("fee.asset")

  const unsupportedFields = Object.keys(quote)
    .filter((key) => !KNOWN.has(key))
    .sort()

  return ok({
    id,
    sellAsset,
    buyAsset,
    sellAmount,
    buyAmount,
    price,
    feeTotal,
    feeAsset,
    feeCurrencyDiffers: feeAsset !== null && feeAsset !== sellAsset,
    unsupportedFields,
    missingTerms
  })
}
