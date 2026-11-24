import { describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { ANCHOR_URL, infoJson } from "@/features/sep6-capability-evidence-auditor/fixtures/normal.fixture"
import { useSep6CapabilityEvidenceAuditor } from "@/features/sep6-capability-evidence-auditor/hooks/useSep6CapabilityEvidenceAuditor"

describe("useSep6CapabilityEvidenceAuditor", () => {
  it("starts idle, succeeds, and resets", () => {
    const { result } = renderHook(() => useSep6CapabilityEvidenceAuditor())
    expect(result.current.state.status).toBe("idle")
    act(() => result.current.submit({ anchorUrl: ANCHOR_URL, infoJson: infoJson() }))
    expect(result.current.state.status).toBe("success")
    act(() => result.current.reset())
    expect(result.current.state.status).toBe("idle")
  })

  it("errors on empty input", () => {
    const { result } = renderHook(() => useSep6CapabilityEvidenceAuditor())
    act(() => result.current.submit({ anchorUrl: "", infoJson: "" }))
    expect(result.current.state).toEqual({ status: "error", code: "empty_input" })
  })
})
