import { Keypair } from "@stellar/stellar-sdk"
import { describe, expect, it } from "vitest"
import { MAX_QUOTE_JSON_LENGTH, parseSep38Input } from "@/features/sep38-quote-expiry-auditor/schema"
import { ANCHOR_ID, EVALUATION_TIME, quoteJson } from "@/features/sep38-quote-expiry-auditor/fixtures/normal.fixture"

const seed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 7)).secret()

function parse(overrides: Partial<{ anchorId: string; evaluationTime: string; quoteJson: string }> = {}) {
  return parseSep38Input({
    anchorId: ANCHOR_ID,
    evaluationTime: EVALUATION_TIME,
    quoteJson: quoteJson(),
    ...overrides
  })
}

describe("parseSep38Input", () => {
  it("rejects an empty field", () => {
    expect(parse({ quoteJson: "  " })).toEqual({ ok: false, code: "empty_input" })
  })

  it("rejects a secret seed before any other check and does not return it", () => {
    const result = parse({ quoteJson: seed })
    expect(result).toEqual({ ok: false, code: "invalid_input" })
    expect(JSON.stringify(result)).not.toContain(seed)
  })

  it("rejects an oversized quote", () => {
    expect(parse({ quoteJson: "x".repeat(MAX_QUOTE_JSON_LENGTH + 1) })).toEqual({ ok: false, code: "too_large" })
  })

  it("accepts a trimmed anchor id", () => {
    const result = parse({ anchorId: `  ${ANCHOR_ID}  ` })
    expect(result.ok && result.value.anchorId).toBe(ANCHOR_ID)
  })
})
