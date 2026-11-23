"use client"

import { useCallback, useState } from "react"
import { runSep6CapabilityEvidenceAuditor } from "@/features/sep6-capability-evidence-auditor/lib/sep6CapabilityEvidenceAuditor"
import type { RawSep6Input } from "@/features/sep6-capability-evidence-auditor/schema"
import { parseSep6Input } from "@/features/sep6-capability-evidence-auditor/schema"
import type { Sep6ErrorCode, Sep6Result } from "@/features/sep6-capability-evidence-auditor/types"

export type Sep6State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: Sep6Result }
  | { status: "error"; code: Sep6ErrorCode }

export function useSep6CapabilityEvidenceAuditor() {
  const [state, setState] = useState<Sep6State>({ status: "idle" })
  const [redactions, setRedactions] = useState(0)

  const submit = useCallback((raw: RawSep6Input) => {
    setState({ status: "loading" })
    const parsed = parseSep6Input(raw)
    if (!parsed.ok) {
      if (parsed.code === "invalid_input") setRedactions((count) => count + 1)
      setState({ status: "error", code: parsed.code })
      return
    }
    const result = runSep6CapabilityEvidenceAuditor(parsed.value)
    setState(result.ok ? { status: "success", result: result.value } : { status: "error", code: result.code })
  }, [])

  const reset = useCallback(() => setState({ status: "idle" }), [])

  return { state, submit, reset, redactions }
}
