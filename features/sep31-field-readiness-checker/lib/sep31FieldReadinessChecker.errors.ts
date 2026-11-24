import type { Sep31ErrorCode } from "@/features/sep31-field-readiness-checker/types"

export function toSep31ErrorCode(error: unknown): Sep31ErrorCode {
  if (error instanceof Error && error.name === "AbortError") return "malformed_data"
  return "malformed_data"
}
