import { err, ok, type Result } from "@/core/result/result"
import { evaluateFieldMap, readinessOf } from "@/features/sep31-field-readiness-checker/lib/field-readiness"
import { selectRequirements } from "@/features/sep31-field-readiness-checker/lib/field-selection"
import type { Sep31ErrorCode, Sep31Input, Sep31Result } from "@/features/sep31-field-readiness-checker/types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function runSep31FieldReadinessChecker(input: Sep31Input): Result<Sep31Result, Sep31ErrorCode> {
  let requirements: unknown
  let fieldMap: unknown
  try {
    requirements = JSON.parse(input.requirementsJson)
    fieldMap = JSON.parse(input.fieldMapJson)
  } catch {
    return err("malformed_data")
  }
  if (!isRecord(fieldMap)) return err("malformed_data")
  if (Object.values(fieldMap).some((value) => typeof value !== "string")) return err("invalid_input")

  const selected = selectRequirements(requirements, input.assetCode, input.context)
  if (!selected.ok) return selected

  const fields = evaluateFieldMap(selected.value, fieldMap)
  const declaredCount =
    Object.keys(selected.value.fields).length + selected.value.required.length + selected.value.optional.length

  return ok({
    anchorId: input.anchorId,
    assetCode: input.assetCode,
    context: input.context,
    readiness: readinessOf(fields, declaredCount),
    fields
  })
}
