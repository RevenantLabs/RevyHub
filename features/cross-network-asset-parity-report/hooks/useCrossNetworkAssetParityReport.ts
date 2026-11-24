"use client"

import { useCallback, useRef, useState } from "react"
import { isErr } from "@/core/result/result"
import { runCrossNetworkAssetParityReport } from "@/features/cross-network-asset-parity-report/lib/crossNetworkAssetParityReport"
import type { RawParityInput } from "@/features/cross-network-asset-parity-report/schema"
import { parseParityInput } from "@/features/cross-network-asset-parity-report/schema"
import type { ParityErrorCode, ParityResult } from "@/features/cross-network-asset-parity-report/types"

export type ParityState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: ParityResult }
  | { status: "error"; code: ParityErrorCode }

export function useCrossNetworkAssetParityReport() {
  const [state, setState] = useState<ParityState>({ status: "idle" })
  const [redactions, setRedactions] = useState(0)
  const requestId = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const submit = useCallback((raw: RawParityInput) => {
    const parsed = parseParityInput(raw)
    if (isErr(parsed)) {
      if (parsed.code === "invalid_input") setRedactions((count) => count + 1)
      setState({ status: "error", code: parsed.code })
      return
    }

    abortRef.current?.abort()
    requestId.current += 1
    const id = requestId.current
    const controller = new AbortController()
    abortRef.current = controller
    setState({ status: "loading" })

    void runCrossNetworkAssetParityReport(parsed.value, {}, controller.signal).then((result) => {
      if (id !== requestId.current) return
      setState(result.ok ? { status: "success", result: result.value } : { status: "error", code: result.code })
    })
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    requestId.current += 1
    setState({ status: "idle" })
  }, [])

  return { state, submit, reset, redactions }
}
