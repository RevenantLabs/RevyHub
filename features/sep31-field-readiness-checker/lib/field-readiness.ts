import type { FieldRow, Readiness } from "@/features/sep31-field-readiness-checker/types"
import type { SelectedFields } from "@/features/sep31-field-readiness-checker/lib/field-selection"

function isOptional(name: string, spec: Record<string, unknown>, selected: SelectedFields): boolean {
  if (selected.optional.includes(name)) return true
  if (selected.required.includes(name)) return false
  return spec.optional === true
}

export function evaluateFieldMap(selected: SelectedFields, fieldMap: Record<string, unknown>): FieldRow[] {
  const rows: FieldRow[] = []
  const declared = new Set<string>([
    ...Object.keys(selected.fields),
    ...selected.required,
    ...selected.optional
  ])

  for (const name of [...declared].sort()) {
    const spec = (selected.fields[name] as Record<string, unknown> | undefined) ?? {}
    const description = typeof spec.description === "string" ? spec.description : null
    const choices = Array.isArray(spec.choices) ? spec.choices.filter((choice): choice is string => typeof choice === "string") : null
    const optional = isOptional(name, spec, selected)
    const supplied = Object.prototype.hasOwnProperty.call(fieldMap, name)
    const value = fieldMap[name]

    if (!supplied) {
      rows.push({
        name,
        description,
        optional,
        choices,
        status: optional ? "present" : "missing",
        reason: optional ? "Optional field was not supplied." : "Required field was not supplied."
      })
      continue
    }

    if (typeof value !== "string" || value.trim().length === 0) {
      rows.push({
        name,
        description,
        optional,
        choices,
        status: "missing",
        reason: "The supplied value is empty."
      })
      continue
    }

    if (choices && !choices.includes(value)) {
      rows.push({
        name,
        description,
        optional,
        choices,
        status: "invalid_choice",
        reason: "The supplied value is not one of the declared choices."
      })
      continue
    }

    rows.push({
      name,
      description,
      optional,
      choices,
      status: "present",
      reason: "Supplied. The value is not shown."
    })
  }

  for (const name of Object.keys(fieldMap).sort()) {
    if (declared.has(name)) continue
    rows.push({
      name,
      description: null,
      optional: null,
      choices: null,
      status: "unsupported",
      reason: "This name is not in the requirement set."
    })
  }

  return rows
}

export function readinessOf(rows: FieldRow[], declaredCount: number): Readiness {
  if (declaredCount === 0 && rows.every((row) => row.status === "unsupported")) {
    return rows.length === 0 ? "empty" : "incomplete"
  }
  if (rows.some((row) => row.status === "missing" || row.status === "invalid_choice" || row.status === "unsupported")) {
    return "incomplete"
  }
  return "ready"
}
