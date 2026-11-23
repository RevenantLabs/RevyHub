import { err, ok, type Result } from "@/core/result/result"
import type { QuoteExpiry, Sep38ErrorCode } from "@/features/sep38-quote-expiry-auditor/types"

/** Parses an ISO-8601 timestamp, including numeric offsets, to epoch milliseconds. */
export function epochMillis(value: string): bigint | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const millis = Date.parse(trimmed)
  if (!Number.isFinite(millis)) return null
  return BigInt(millis)
}

/**
 * A quote is active only while the evaluation instant is strictly before
 * expires_at. The exact expiry instant is expired, so the boundary is tested
 * rather than rounded.
 */
export function evaluateQuoteExpiry(
  expiresAt: string,
  evaluationTime: string
): Result<QuoteExpiry, Sep38ErrorCode> {
  const expires = epochMillis(expiresAt)
  const evaluation = epochMillis(evaluationTime)
  if (expires === null || evaluation === null) return err("malformed_data")

  const boundary = expires > evaluation ? "before" : expires === evaluation ? "exact" : "after"
  return ok({
    expiresAt,
    evaluationTime,
    expiresAtEpochMs: expires.toString(),
    evaluationEpochMs: evaluation.toString(),
    status: boundary === "before" ? "active" : "expired",
    boundary
  })
}
