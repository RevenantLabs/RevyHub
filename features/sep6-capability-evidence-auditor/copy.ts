import type { Sep6ErrorCode } from "@/features/sep6-capability-evidence-auditor/types"

export const copy = {
  anchorLabel: "Anchor URL",
  anchorHint: "HTTPS anchor origin you pasted the /info response from. Nothing is fetched.",
  infoLabel: "SEP-6 /info JSON",
  infoHint: "Paste the /info document. Absent flags stay absent; they are not treated as false or zero.",
  submit: "Audit capabilities",
  working: "Auditing capabilities",
  emptyTitle: "No /info document audited yet",
  emptyDescription: "Paste an anchor /info response to see deposit, withdraw, and exchange capabilities per asset.",
  resultTitle: "Capability evidence",
  incompleteTitle: "Evidence is incomplete",
  incompleteDescription:
    "A capability is malformed, has no fee model, or has a min/max range that cannot be compared. Missing fields were not filled in.",
  emptyRecords: "The document declared no deposit, withdraw, or exchange sections."
} as const

export const errorCopy: Record<Sep6ErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "The anchor URL and /info JSON are both required",
    description: "Paste the document you already downloaded. An empty paste is not an anchor with no assets."
  },
  invalid_input: {
    title: "That input cannot be audited",
    description: "Use an https URL and remove any secret seed. The seed is not stored."
  },
  malformed_data: {
    title: "The /info JSON could not be read",
    description: "Paste one JSON object, the SEP-6 /info response, not a fragment."
  },
  unsupported_variant: {
    title: "Only https anchor URLs are accepted",
    description: "Change the URL to https. This tool still will not call it."
  },
  too_large: {
    title: "The pasted /info document is too large",
    description: "Paste a single /info response under 40,000 characters."
  }
}
