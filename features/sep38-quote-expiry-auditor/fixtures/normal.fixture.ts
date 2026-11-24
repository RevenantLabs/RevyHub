export const ANCHOR_ID = "anchor-demo"
export const EVALUATION_TIME = "2026-06-01T12:00:00.000Z"
export const ACTIVE_EXPIRES = "2026-06-01T13:00:00.000Z"
export const EXPIRED_EXPIRES = "2026-06-01T11:00:00.000Z"
export const OFFSET_SAME_AS_EVALUATION = "2026-06-01T15:00:00.000+03:00"

export const SELL_ASSET = "stellar:USDC:GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
export const BUY_ASSET = "iso4217:USD"
export const FEE_ASSET_OTHER = "iso4217:EUR"

export function quoteRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "quote-100",
    expires_at: ACTIVE_EXPIRES,
    sell_asset: SELL_ASSET,
    buy_asset: BUY_ASSET,
    sell_amount: "100.0000000",
    buy_amount: "99.5000000",
    price: "0.995",
    fee: { total: "0.5000000", asset: SELL_ASSET },
    ...overrides
  }
}

export function quoteJson(overrides: Record<string, unknown> = {}) {
  return JSON.stringify(quoteRecord(overrides))
}
