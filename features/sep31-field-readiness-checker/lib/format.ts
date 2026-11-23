import type { FieldRow, Readiness } from "@/features/sep31-field-readiness-checker/types"

export function formatReadiness(readiness: Readiness): string {
  if (readiness === "ready") return "Ready. Every required field is present and no value is displayed."
  if (readiness === "empty") return "Empty requirement set. Nothing was invented for this asset."
  return "Incomplete. See the field reasons. Supplied values stay hidden."
}

export function formatChoices(row: FieldRow): string {
  if (!row.choices || row.choices.length === 0) return "not declared"
  return row.choices.join(", ")
}
