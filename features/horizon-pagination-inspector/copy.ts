import type { HorizonPaginationInspectorErrorCode } from "@/features/horizon-pagination-inspector/types";

export const copy = {
  formTitle: "Inspect Horizon Collection",
  formDescription:
    "Paste a Horizon HAL collection response to analyze paging links, record counts, cursor tokens, and missing or duplicate identifiers offline.",
  collectionLabel: "Horizon Collection JSON",
  collectionHint: "Paste the complete JSON collection envelope with _embedded.records and _links.",
  collectionPlaceholder: '{\n  "_embedded": {\n    "records": [...] \n  },\n  "_links": {\n    "self": { "href": "..." }\n  }\n}',
  expectedOriginLabel: "Expected Base Origin (optional)",
  expectedOriginHint: "e.g. https://horizon.stellar.org. Off-origin links will be flagged.",
  expectedOriginPlaceholder: "https://horizon.stellar.org",
  submit: "Inspect collection",
  resetAll: "Reset",

  emptyTitle: "No collection inspected yet",
  emptyDescription:
    "Paste a Horizon collection response envelope above. The inspector checks paging links, cursors, and records completely offline without making network calls.",

  overviewTitle: "Collection Overview",
  recordsTitle: "Records & Identifiers",
  linksTitle: "Pagination Links",
  exportTitle: "Diagnostic JSON Export",
  exportDescription: "Copy the full offline inspection diagnosis as deterministic JSON.",
  copyExport: "Copy diagnostic JSON",

  labelRecordCount: "Records on page",
  labelUniqueIds: "Unique record IDs",
  labelDuplicateIds: "Duplicate record IDs",
  labelMissingIds: "Missing record IDs",
  labelUniqueTokens: "Unique paging tokens",
  labelDuplicateTokens: "Duplicate paging tokens",
  labelMissingTokens: "Missing paging tokens",
  labelExpectedOrigin: "Expected origin",
  noneProvided: "None provided",

  pageCautionTitle: "Single-page observation note",
  pageCautionDescription:
    "This tool is an offline diagnostic for a single pasted page, not a crawler. A short page or 0 records does not establish that all records have been loaded unless the next link is absent.",

  anomaliesDetectedTitle: "Anomalies detected in collection",
  anomaliesDetectedDescription:
    "One or more records contain duplicate identifiers or are missing paging metadata.",

  noAnomaliesTitle: "Identifiers verified",
  noAnomaliesDescription: "All records provide unique IDs and valid paging tokens.",

  offOriginTitle: "Off-origin links detected",
  offOriginDescription:
    "One or more links point to an origin different from the expected base origin.",

  opaqueCursorNote:
    "Horizon cursors are opaque paging tokens, not numbers. Do not parse them as arithmetic integers or increment them.",

  columnRecordIndex: "Index",
  columnId: "Record ID",
  columnPagingToken: "Paging Token",
  columnStatus: "Status",

  badgeValid: "Valid",
  badgeDuplicate: "Duplicate",
  badgeMissing: "Missing",
  badgeOffOrigin: "Off-origin",
  badgeHostile: "Untrusted Scheme",
  badgeTemplated: "Templated",

  noRecords: "This collection contains 0 records (empty page).",
  noLinks: "No paging links found in collection.",

  copyLink: "Copy URL",
  inertUrlNote: "Link copy controls are disabled for unsupported or non-HTTP(S) schemes."
} as const;

export const errorCopy: Record<
  HorizonPaginationInspectorErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Collection input is required",
    description: "Paste a Horizon JSON collection containing _embedded.records and _links."
  },
  invalid_input: {
    title: "Invalid input",
    description:
      "The input contains an invalid format or secret key seed. Secret keys are never accepted."
  },
  input_too_large: {
    title: "Input exceeds size bound",
    description:
      "The pasted collection exceeds the 1 MB safety threshold. Shorten the payload before inspecting."
  },
  invalid_json: {
    title: "Malformed JSON",
    description: "The input could not be parsed as valid JSON. Check for trailing commas or syntax errors."
  },
  invalid_collection: {
    title: "Not a Horizon collection",
    description:
      "The JSON must be an object with an '_embedded.records' array and a '_links' object."
  }
};
