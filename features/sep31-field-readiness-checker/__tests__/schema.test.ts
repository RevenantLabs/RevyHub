import { Keypair } from "@stellar/stellar-sdk"
import { describe, expect, it } from "vitest"
import { ANCHOR_ID, ASSET_CODE, fieldMapJson, requirementsJson } from "@/features/sep31-field-readiness-checker/fixtures/normal.fixture"
import { MAX_JSON_LENGTH, parseSep31Input } from "@/features/sep31-field-readiness-checker/schema"

function parse(overrides: Record<string, string> = {}) {
  return parseSep31Input({
    anchorId: ANCHOR_ID,
    assetCode: ASSET_CODE,
    context: "sender",
    requirementsJson: requirementsJson(),
    fieldMapJson: fieldMapJson(),
    ...overrides
  })
}

describe("parseSep31Input", () => {
  it("rejects an empty field", () => {
    expect(parse({ fieldMapJson: " " })).toEqual({ ok: false, code: "empty_input" })
  })

  it("rejects a secret seed and does not return it", () => {
    const secret = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 4)).secret()
    const result = parse({ fieldMapJson: secret })
    expect(result).toEqual({ ok: false, code: "invalid_input" })
    expect(JSON.stringify(result)).not.toContain(secret)
  })

  it("rejects an unknown context and an oversized document", () => {
    expect(parse({ context: "both" })).toEqual({ ok: false, code: "unsupported_variant" })
    expect(parse({ requirementsJson: "x".repeat(MAX_JSON_LENGTH + 1) })).toEqual({ ok: false, code: "too_large" })
  })
})
