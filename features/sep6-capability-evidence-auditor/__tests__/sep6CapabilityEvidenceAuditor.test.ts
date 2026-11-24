import { describe, expect, it } from "vitest"
import { ANCHOR_URL, infoJson, infoRecord } from "@/features/sep6-capability-evidence-auditor/fixtures/normal.fixture"
import { runSep6CapabilityEvidenceAuditor } from "@/features/sep6-capability-evidence-auditor/lib/sep6CapabilityEvidenceAuditor"

describe("runSep6CapabilityEvidenceAuditor", () => {
  it("audits a complete /info document", () => {
    const result = runSep6CapabilityEvidenceAuditor({ anchorUrl: ANCHOR_URL, infoJson: infoJson() })
    expect(result.ok && result.value.completeness).toBe("incomplete")
    expect(result.ok && result.value.records).toHaveLength(2)
    expect(result.ok && result.value.anchorUrl).toBe(ANCHOR_URL)
    expect(infoRecord.deposit.USD.fee_fixed).toBe("0.10")
  })

  it("treats a document with no capability sections as incomplete rather than an error", () => {
    const result = runSep6CapabilityEvidenceAuditor({ anchorUrl: ANCHOR_URL, infoJson: "{}" })
    expect(result.ok && result.value.completeness).toBe("incomplete")
    expect(result.ok && result.value.records).toEqual([])
  })

  it("rejects malformed JSON", () => {
    expect(runSep6CapabilityEvidenceAuditor({ anchorUrl: ANCHOR_URL, infoJson: "[" })).toEqual({
      ok: false,
      code: "malformed_data"
    })
  })
})
