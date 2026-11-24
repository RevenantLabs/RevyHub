"use client"

import { useCallback, useState } from "react"
import { runSep38QuoteExpiryAuditor } from "@/features/sep38-quote-expiry-auditor/lib/sep38QuoteExpiryAuditor"
import type { RawSep38Input } from "@/features/sep38-quote-expiry-auditor/schema"
import { parseSep38Input } from "@/features/sep38-quote-expiry-auditor/schema"
import type { Sep38ErrorCode, Sep38Result } from "@/features/sep38-quote-expiry-auditor/types"

export type Sep38State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: Sep38Result }
  | { status: "error"; code: Sep38ErrorCode }

export function useSep38QuoteExpiryAuditor() {
  const [state, setState] = useState<Sep38State>({ status: "idle" })
  const [redactions, setRedactions] = useState(0)

  const submit = useCallback((raw: RawSep38Input) => {
    setState({ status: "loading" })
    const parsed = parseSep38Input(raw)
    if (!parsed.ok) {
      if (parsed.code === "invalid_input") setRedactions((count) => count + 1)
      setState({ status: "error", code: parsed.code })
      return
    }
    const result = runSep38QuoteExpiryAuditor(parsed.value)
    setState(result.ok ? { status: "success", result: result.value } : { status: "error", code: result.code })
  }, [])

  const reset = useCallback(() => setState({ status: "idle" }), [])

  return { state, submit, reset, redactions }
}
