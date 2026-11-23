import { Keypair } from "@stellar/stellar-sdk"
import { describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { ANCHOR_ID, EVALUATION_TIME, quoteJson } from "@/features/sep38-quote-expiry-auditor/fixtures/normal.fixture"
import { useSep38QuoteExpiryAuditor } from "@/features/sep38-quote-expiry-auditor/hooks/useSep38QuoteExpiryAuditor"

describe("useSep38QuoteExpiryAuditor", () => {
  it("starts idle and returns there after reset", () => {
    const { result } = renderHook(() => useSep38QuoteExpiryAuditor())
    expect(result.current.state.status).toBe("idle")
    act(() => {
      result.current.submit({ anchorId: ANCHOR_ID, evaluationTime: EVALUATION_TIME, quoteJson: quoteJson() })
    })
    expect(result.current.state.status).toBe("success")
    act(() => result.current.reset())
    expect(result.current.state.status).toBe("idle")
  })

  it("reports empty input without leaving a success result behind", () => {
    const { result } = renderHook(() => useSep38QuoteExpiryAuditor())
    act(() => {
      result.current.submit({ anchorId: "", evaluationTime: "", quoteJson: "" })
    })
    expect(result.current.state).toEqual({ status: "error", code: "empty_input" })
  })

  it("drops a secret seed and remounts the form", () => {
    const { result } = renderHook(() => useSep38QuoteExpiryAuditor())
    const secret = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).secret()
    act(() => {
      result.current.submit({
        anchorId: ANCHOR_ID,
        evaluationTime: EVALUATION_TIME,
        quoteJson: secret
      })
    })
    expect(result.current.state.status).toBe("error")
    expect(result.current.redactions).toBe(1)
    expect(JSON.stringify(result.current.state)).not.toContain(secret)
  })
})
