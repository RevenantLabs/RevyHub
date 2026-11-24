import { err, ok, type Result } from "@/core/result/result"
import type { FieldContext, Sep31ErrorCode } from "@/features/sep31-field-readiness-checker/types"

export interface SelectedFields {
  fields: Record<string, unknown>
  required: string[]
  optional: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readList(value: unknown): string[] | null {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.length === 0)) return null
  return value
}

function fromNode(node: Record<string, unknown>): Result<SelectedFields, Sep31ErrorCode> {
  if (node.fields !== undefined && !isRecord(node.fields)) return err("unsupported_variant")
  const required = readList(node.required)
  const optional = readList(node.optional)
  if (required === null || optional === null) return err("malformed_data")
  const overlap = required.filter((name) => optional.includes(name))
  if (overlap.length > 0) return err("unsupported_variant")

  const fields = (node.fields as Record<string, unknown> | undefined) ?? {}
  for (const [name, spec] of Object.entries(fields)) {
    if (!isRecord(spec)) return err("malformed_data")
    if (spec.optional !== undefined && typeof spec.optional !== "boolean") return err("malformed_data")
    if (spec.optional === true && required.includes(name)) return err("unsupported_variant")
    if (spec.optional === false && optional.includes(name)) return err("unsupported_variant")
    if (spec.choices !== undefined) {
      if (!Array.isArray(spec.choices) || spec.choices.some((choice) => typeof choice !== "string")) {
        return err("malformed_data")
      }
    }
  }

  return ok({ fields, required, optional })
}

export function selectRequirements(
  document: unknown,
  assetCode: string,
  context: FieldContext
): Result<SelectedFields, Sep31ErrorCode> {
  if (!isRecord(document)) return err("malformed_data")
  if (Array.isArray(document.fields)) return err("unsupported_variant")

  const nested = document[context]
  if (nested !== undefined) {
    if (!isRecord(nested)) return err("unsupported_variant")
    const assetNode = nested[assetCode]
    if (isRecord(assetNode)) return fromNode(assetNode)
    if (assetNode !== undefined) return err("unsupported_variant")
    if (nested.fields !== undefined || nested.required !== undefined || nested.optional !== undefined) {
      return fromNode(nested)
    }
    return ok({ fields: {}, required: [], optional: [] })
  }

  if (document.sender !== undefined || document.receiver !== undefined) {
    return ok({ fields: {}, required: [], optional: [] })
  }

  return fromNode(document)
}
