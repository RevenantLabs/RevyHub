import type { Sep6ErrorCode } from "@/features/sep6-capability-evidence-auditor/types"

export function toSep6ErrorCode(error: unknown): Sep6ErrorCode {
  if (error instanceof Error && error.name === "AbortError") return "malformed_data"
  return "malformed_data"
}
