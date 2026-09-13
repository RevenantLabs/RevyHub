import type { Sep12FieldsErrorCode } from "@/features/sep12-fields/types";

export const copy = {
  formLabel: "Field name or keyword",
  formHint:
    "Search the SEP-9 field set. Leave it empty to list every field. Underscores and dots are part of the name, so they are matched exactly as typed.",
  submit: "Search fields",
  emptyTitle: "No field searched yet",
  emptyDescription:
    "Search for a SEP-9 field to check the exact canonical name an anchor will match on, or submit an empty search to list the whole set.",
  resultsTitle: "Matching fields",
  noMatchesTitle: "No SEP-9 field matches that search",
  noMatchesDescription:
    "Check the spelling against the field set below, or search for a shorter fragment. A near-miss name is the failure this reference exists to catch.",
  showAllHint: "Submit an empty search to list every field.",
  requirementTitle: "Which fields are required",
  requirementNote:
    "SEP-9 defines the names and types of these fields. It does not decide which of them an anchor will ask you for — that comes from the anchor's own customer request and can differ between anchors for the same account, so a field listed here is not a promise that it will be requested.",
  camelCaseLabel: "Often written as",
  camelCaseNote:
    "The standard names are snake_case. Integrations frequently camelCase them instead, so both spellings are shown — but the snake_case name is the one an anchor matches on.",
  labelType: "Type",
  labelGroup: "Group",
  labelCanonical: "Canonical name",
  groupNote:
    "Organization fields carry the organization prefix as part of the name; the prefix is not a namespace you may re-case."
} as const;

export const errorCopy: Record<Sep12FieldsErrorCode, { title: string; description: string }> = {
  query_too_long: {
    title: "That search is too long to be a field name",
    description:
      "A SEP-9 field name is a few dozen characters. This looks like a document pasted into the search box — try a field name or a short keyword instead."
  }
};
