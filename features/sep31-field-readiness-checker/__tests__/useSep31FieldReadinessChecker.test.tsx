import { describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { ANCHOR_ID, ASSET_CODE, fieldMapJson, requirementsJson } from "@/features/sep31-field-readiness-checker/fixtures/normal.fixture"
import { useSep31FieldReadinessChecker } from "@/features/sep31-field-readiness-checker/hooks/useSep31FieldReadinessChecker"

describe("useSep31FieldReadinessChecker", () => {
  it("starts idle, succeeds, and resets", () => {
    const { result } = renderHook(() => useSep31FieldReadinessChecker())
    expect(result.current.state.status).toBe("idle")
    act(() => {
      result.current.submit({
        anchorId: ANCHOR_ID,
        assetCode: ASSET_CODE,
        context: "sender",
        requirementsJson: requirementsJson(),
        fieldMapJson: fieldMapJson()
      })
    })
    expect(result.current.state.status).toBe("success")
    act(() => result.current.reset())
    expect(result.current.state.status).toBe("idle")
  })

  it("errors on empty input", () => {
    const { result } = renderHook(() => useSep31FieldReadinessChecker())
    act(() => {
      result.current.submit({ anchorId: "", assetCode: "", context: "", requirementsJson: "", fieldMapJson: "" })
    })
    expect(result.current.state).toEqual({ status: "error", code: "empty_input" })
  })
})
