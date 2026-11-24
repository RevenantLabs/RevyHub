export type Sep31ErrorCode =
  | "empty_input"
  | "invalid_input"
  | "malformed_data"
  | "unsupported_variant"
  | "too_large"

export type FieldContext = "sender" | "receiver"

export type FieldStatus = "missing" | "present" | "invalid_choice" | "unsupported"

export type Readiness = "ready" | "incomplete" | "empty"

export interface Sep31Input {
  anchorId: string
  assetCode: string
  context: FieldContext
  requirementsJson: string
  fieldMapJson: string
}

export interface FieldRow {
  name: string
  description: string | null
  optional: boolean | null
  choices: string[] | null
  status: FieldStatus
  reason: string
}

export interface Sep31Result {
  anchorId: string
  assetCode: string
  context: FieldContext
  readiness: Readiness
  fields: FieldRow[]
}
