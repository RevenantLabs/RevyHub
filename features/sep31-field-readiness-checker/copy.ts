import type { Sep31ErrorCode } from "@/features/sep31-field-readiness-checker/types"

export const copy = {
  anchorLabel: "Anchor identifier",
  assetLabel: "Asset code",
  contextLabel: "Field context",
  requirementsLabel: "Field requirement JSON",
  requirementsHint: "Recorded anchor requirements. Nothing is requested from the anchor.",
  fieldMapLabel: "Local field map JSON",
  fieldMapHint: "Values stay in this box only until the check runs, then this box is cleared.",
  submit: "Check readiness",
  working: "Checking readiness",
  emptyTitle: "No field set checked yet",
  emptyDescription: "Paste a recorded SEP-31 field requirement document and a local field map.",
  resultTitle: "Field readiness",
  contextSender: "sender",
  contextReceiver: "receiver"
} as const

export const errorCopy: Record<Sep31ErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Every field is required before a check",
    description: "Add the anchor, asset, context, requirements, and field map. An empty map is {} rather than a blank box."
  },
  invalid_input: {
    title: "That input cannot be checked",
    description: "Use a 1–12 character asset code and string field values. Secret seeds are refused and not stored."
  },
  malformed_data: {
    title: "The JSON could not be read",
    description: "Paste one requirements object and one field-map object."
  },
  unsupported_variant: {
    title: "That requirement shape is not a readiness result",
    description: "Use sender or receiver, and do not mark the same field both required and optional."
  },
  too_large: {
    title: "The pasted JSON is too large",
    description: "Keep each document under 20,000 characters."
  }
}
