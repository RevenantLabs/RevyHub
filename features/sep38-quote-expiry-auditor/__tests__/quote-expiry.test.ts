import { describe, expect, it } from "vitest"
import {
  ACTIVE_EXPIRES,
  EVALUATION_TIME,
  EXPIRED_EXPIRES,
  OFFSET_SAME_AS_EVALUATION
} from "@/features/sep38-quote-expiry-auditor/fixtures/normal.fixture"
import { evaluateQuoteExpiry } from "@/features/sep38-quote-expiry-auditor/lib/quote-expiry"

describe("evaluateQuoteExpiry", () => {
  it("treats a later expires_at as active", () => {
    const result = evaluateQuoteExpiry(ACTIVE_EXPIRES, EVALUATION_TIME)
    expect(result.ok && result.value.status).toBe("active")
    expect(result.ok && result.value.boundary).toBe("before")
  })

  it("treats the exact expiry instant as expired", () => {
    const result = evaluateQuoteExpiry(EVALUATION_TIME, EVALUATION_TIME)
    expect(result.ok && result.value.boundary).toBe("exact")
    expect(result.ok && result.value.status).toBe("expired")
  })

  it("treats an earlier expires_at as expired", () => {
    const result = evaluateQuoteExpiry(EXPIRED_EXPIRES, EVALUATION_TIME)
    expect(result.ok && result.value.boundary).toBe("after")
  })

  it("equates a timezone offset with the same UTC instant", () => {
    const offset = evaluateQuoteExpiry(OFFSET_SAME_AS_EVALUATION, EVALUATION_TIME)
    const utc = evaluateQuoteExpiry(EVALUATION_TIME, EVALUATION_TIME)
    expect(offset.ok && utc.ok && offset.value.expiresAtEpochMs).toBe(utc.value.expiresAtEpochMs)
    expect(offset.ok && offset.value.status).toBe("expired")
  })

  it("rejects an unreadable timestamp", () => {
    expect(evaluateQuoteExpiry("tomorrow", EVALUATION_TIME)).toEqual({ ok: false, code: "malformed_data" })
  })
})
