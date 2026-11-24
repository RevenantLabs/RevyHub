import { describe, expect, it } from "vitest"
import { emptyRequirements } from "@/features/sep31-field-readiness-checker/fixtures/boundary.fixture"
import {
  ANCHOR_ID,
  ASSET_CODE,
  EMAIL,
  fieldMapJson,
  requirementsJson
} from "@/features/sep31-field-readiness-checker/fixtures/normal.fixture"
import { runSep31FieldReadinessChecker } from "@/features/sep31-field-readiness-checker/lib/sep31FieldReadinessChecker"

const base = {
  anchorId: ANCHOR_ID,
  assetCode: ASSET_CODE,
  context: "sender" as const
}

describe("runSep31FieldReadinessChecker", () => {
  it("returns ready without the supplied email", () => {
    const result = runSep31FieldReadinessChecker({
      ...base,
      requirementsJson: requirementsJson(),
      fieldMapJson: fieldMapJson()
    })
    expect(result.ok && result.value.readiness).toBe("ready")
    expect(JSON.stringify(result)).not.toContain(EMAIL)
  })

  it("returns an empty readiness for an empty requirement set", () => {
    const result = runSep31FieldReadinessChecker({
      ...base,
      requirementsJson: JSON.stringify(emptyRequirements),
      fieldMapJson: "{}"
    })
    expect(result.ok && result.value.readiness).toBe("empty")
  })

  it("rejects a contradictory schema as unsupported rather than ready", () => {
    const result = runSep31FieldReadinessChecker({
      ...base,
      requirementsJson: JSON.stringify({ fields: { email_address: { optional: true } }, required: ["email_address"] }),
      fieldMapJson: "{}"
    })
    expect(result).toEqual({ ok: false, code: "unsupported_variant" })
  })

  it("rejects malformed JSON", () => {
    expect(
      runSep31FieldReadinessChecker({ ...base, requirementsJson: "{", fieldMapJson: "{}" })
    ).toEqual({ ok: false, code: "malformed_data" })
  })
})
