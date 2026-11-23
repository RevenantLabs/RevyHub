import { Keypair } from "@stellar/stellar-sdk"
import { describe, expect, it } from "vitest"
import { ANCHOR_URL, infoJson } from "@/features/sep6-capability-evidence-auditor/fixtures/normal.fixture"
import { MAX_INFO_JSON_LENGTH, parseSep6Input } from "@/features/sep6-capability-evidence-auditor/schema"

describe("parseSep6Input", () => {
  it("rejects empty input", () => {
    expect(parseSep6Input({ anchorUrl: " ", infoJson: "" })).toEqual({ ok: false, code: "empty_input" })
  })

  it("rejects a secret seed and does not return it", () => {
    const secret = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 3)).secret()
    const result = parseSep6Input({ anchorUrl: ANCHOR_URL, infoJson: secret })
    expect(result).toEqual({ ok: false, code: "invalid_input" })
    expect(JSON.stringify(result)).not.toContain(secret)
  })

  it("rejects a non-https URL and an oversized document", () => {
    expect(parseSep6Input({ anchorUrl: "http://anchor.example", infoJson: infoJson() })).toEqual({
      ok: false,
      code: "unsupported_variant"
    })
    expect(parseSep6Input({ anchorUrl: ANCHOR_URL, infoJson: "x".repeat(MAX_INFO_JSON_LENGTH + 1) })).toEqual({
      ok: false,
      code: "too_large"
    })
  })
})
