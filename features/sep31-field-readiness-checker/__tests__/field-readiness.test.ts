import { describe, expect, it } from "vitest"
import { invalidChoiceMap, missingRequired } from "@/features/sep31-field-readiness-checker/fixtures/boundary.fixture"
import { EMAIL, fieldMapRecord, requirementsRecord } from "@/features/sep31-field-readiness-checker/fixtures/normal.fixture"
import { evaluateFieldMap, readinessOf } from "@/features/sep31-field-readiness-checker/lib/field-readiness"
import { selectRequirements } from "@/features/sep31-field-readiness-checker/lib/field-selection"

describe("evaluateFieldMap", () => {
  it("does not copy supplied values into the rows", () => {
    const selected = selectRequirements(requirementsRecord, "USDC", "sender")
    if (!selected.ok) throw new Error("expected selection")
    const rows = evaluateFieldMap(selected.value, fieldMapRecord)
    expect(JSON.stringify(rows)).not.toContain(EMAIL)
    expect(rows.every((row) => row.status === "present")).toBe(true)
    expect(readinessOf(rows, 2)).toBe("ready")
  })

  it("marks a missing required field", () => {
    const selected = selectRequirements(missingRequired, "USDC", "sender")
    if (!selected.ok) throw new Error("expected selection")
    const rows = evaluateFieldMap(selected.value, {})
    expect(rows[0]?.status).toBe("missing")
    expect(readinessOf(rows, 1)).toBe("incomplete")
  })

  it("marks a choice outside the declared list without echoing it", () => {
    const selected = selectRequirements(requirementsRecord, "USDC", "sender")
    if (!selected.ok) throw new Error("expected selection")
    const rows = evaluateFieldMap(selected.value, { email_address: EMAIL, ...invalidChoiceMap })
    const country = rows.find((row) => row.name === "bank_country")
    expect(country?.status).toBe("invalid_choice")
    expect(JSON.stringify(rows)).not.toContain("ZZ")
  })

  it("marks a field the requirements do not declare", () => {
    const selected = selectRequirements(missingRequired, "USDC", "sender")
    if (!selected.ok) throw new Error("expected selection")
    const rows = evaluateFieldMap(selected.value, { email_address: EMAIL, nickname: "hidden" })
    expect(rows.find((row) => row.name === "nickname")?.status).toBe("unsupported")
    expect(JSON.stringify(rows)).not.toContain("hidden")
  })
})
