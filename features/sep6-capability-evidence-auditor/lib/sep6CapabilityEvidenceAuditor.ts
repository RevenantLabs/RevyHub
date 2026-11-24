import { err, ok, type Result } from "@/core/result/result"
import { readCapabilitySections } from "@/features/sep6-capability-evidence-auditor/lib/capability-sections"
import type { Sep6ErrorCode, Sep6Input, Sep6Result } from "@/features/sep6-capability-evidence-auditor/types"

export function runSep6CapabilityEvidenceAuditor(input: Sep6Input): Result<Sep6Result, Sep6ErrorCode> {
  let parsed: unknown
  try {
    parsed = JSON.parse(input.infoJson)
  } catch {
    return err("malformed_data")
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return err("malformed_data")

  const records = readCapabilitySections(parsed as Record<string, unknown>)
  const directions = [...new Set(records.map((record) => record.direction))]
  const incomplete = records.some(
    (record) => record.malformed || record.feeModel === "absent" || record.amountRange === "incompatible"
  )

  return ok({
    anchorUrl: input.anchorUrl,
    records,
    directions,
    completeness: incomplete || records.length === 0 ? "incomplete" : "complete"
  })
}
