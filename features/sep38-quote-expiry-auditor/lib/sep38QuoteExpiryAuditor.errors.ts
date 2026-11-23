import type { Sep38ErrorCode } from "@/features/sep38-quote-expiry-auditor/types"

/** This tool never performs a request. Unexpected throws stay malformed input. */
export function toSep38ErrorCode(error: unknown): Sep38ErrorCode {
  if (error instanceof Error && error.name === "AbortError") return "malformed_data"
  return "malformed_data"
}
