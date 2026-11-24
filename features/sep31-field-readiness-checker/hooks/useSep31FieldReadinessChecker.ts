"use client"

import { useCallback, useState } from "react"
import { runSep31FieldReadinessChecker } from "@/features/sep31-field-readiness-checker/lib/sep31FieldReadinessChecker"
import type { RawSep31Input } from "@/features/sep31-field-readiness-checker/schema"
import { parseSep31Input } from "@/features/sep31-field-readiness-checker/schema"
import type { Sep31ErrorCode, Sep31Result } from "@/features/sep31-field-readiness-checker/types"

export type Sep31State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: Sep31Result }
  | { status: "error"; code: Sep31ErrorCode }

export function useSep31FieldReadinessChecker() {
  const [state, setState] = useState<Sep31State>({ status: "idle" })
  const [redactions, setRedactions] = useState(0)

  const submit = useCallback((raw: RawSep31Input) => {
    setState({ status: "loading" })
    const parsed = parseSep31Input(raw)
    if (!parsed.ok) {
      if (parsed.code === "invalid_input") setRedactions((count) => count + 1)
      setState({ status: "error", code: parsed.code })
      return
    }
    const result = runSep31FieldReadinessChecker(parsed.value)
    if (!result.ok) {
      setState({ status: "error", code: result.code })
      return
    }
    setRedactions((count) => count + 1)
    setState({ status: "success", result: result.value })
  }, [])

  const reset = useCallback(() => setState({ status: "idle" }), [])

  return { state, submit, reset, redactions }
}
