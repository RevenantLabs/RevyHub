import { describe, expect, it } from "vitest"
import { contradictory, emptyRequirements, unsupportedShape } from "@/features/sep31-field-readiness-checker/fixtures/boundary.fixture"
import { requirementsRecord } from "@/features/sep31-field-readiness-checker/fixtures/normal.fixture"
import { selectRequirements } from "@/features/sep31-field-readiness-checker/lib/field-selection"

describe("selectRequirements", () => {
  it("selects the sender fields for the named asset", () => {
    const result = selectRequirements(requirementsRecord, "USDC", "sender")
    expect(result.ok && Object.keys(result.value.fields)).toEqual(["email_address", "bank_country"])
  })

  it("selects a different set for the receiver", () => {
    const result = selectRequirements(requirementsRecord, "USDC", "receiver")
    expect(result.ok && Object.keys(result.value.fields)).toEqual(["email_address"])
  })

  it("returns an empty set when the asset has no fields", () => {
    const result = selectRequirements(emptyRequirements, "USDC", "sender")
    expect(result.ok && result.value.fields).toEqual({})
  })

  it("refuses a contradictory required and optional declaration", () => {
    expect(selectRequirements(contradictory, "USDC", "sender")).toEqual({ ok: false, code: "unsupported_variant" })
  })

  it("refuses an array instead of a requirement object", () => {
    expect(selectRequirements(unsupportedShape, "USDC", "sender")).toEqual({ ok: false, code: "malformed_data" })
  })
})
