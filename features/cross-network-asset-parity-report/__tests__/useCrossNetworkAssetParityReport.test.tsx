import { describe, expect, it } from "vitest"
import { act, renderHook, waitFor } from "@testing-library/react"
import { withMswHandlers } from "@/core/testing/msw"
import { pairsJson } from "@/features/cross-network-asset-parity-report/fixtures/normal.fixture"
import { handlers } from "@/features/cross-network-asset-parity-report/msw/handlers"
import { useCrossNetworkAssetParityReport } from "@/features/cross-network-asset-parity-report/hooks/useCrossNetworkAssetParityReport"

withMswHandlers(...handlers)

describe("useCrossNetworkAssetParityReport", () => {
  it("starts idle and reports a loaded pair", async () => {
    const { result } = renderHook(() => useCrossNetworkAssetParityReport())
    expect(result.current.state.status).toBe("idle")
    act(() => {
      result.current.submit({ pairsJson: pairsJson() })
    })
    await waitFor(() => expect(result.current.state.status).toBe("success"))
  })

  it("errors on empty input without calling Horizon", () => {
    const { result } = renderHook(() => useCrossNetworkAssetParityReport())
    act(() => result.current.submit({ pairsJson: "" }))
    expect(result.current.state).toEqual({ status: "error", code: "empty_input" })
  })

  it("drops a stale response when reset runs first", async () => {
    const { result } = renderHook(() => useCrossNetworkAssetParityReport())
    act(() => result.current.submit({ pairsJson: pairsJson() }))
    act(() => result.current.reset())
    expect(result.current.state.status).toBe("idle")
    await waitFor(() => expect(result.current.state.status).toBe("idle"))
  })
})
