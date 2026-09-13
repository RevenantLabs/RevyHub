import type { PaginationErrorCode } from "@/features/horizon-pagination-inspector/types";

export const copy = {
  formLabel: "Horizon collection response",
  formHint:
    "Paste the JSON body of a Horizon collection response. Everything is read in your browser — nothing is sent anywhere.",
  submit: "Inspect response",
  emptyTitle: "No response inspected yet",
  emptyDescription:
    "Paste a Horizon collection response to see its paging links, cursor tokens, record count and duplicate or missing identifiers.",
  summaryTitle: "This page",
  linksTitle: "Paging links",
  identifiersTitle: "Identifiers",
  labelRecordCount: "Records on this page",
  labelNext: "Next link",
  labelPrev: "Prev link",
  labelCursor: "Cursor token",
  labelTokenOrder: "Paging token order",
  labelDuplicates: "Duplicate identifiers",
  labelMissing: "Records with no identifier",
  labelNonNumeric: "Records with a non-numeric paging token",
  noneDetected: "None",
  linkAbsent: "Not present in this response",
  linksObjectAbsentTitle: "This response carries no paging links",
  linksObjectAbsent:
    "This response has no _links object at all, so it carries no paging information. That is not the same as being the last page.",
  cursorNote:
    "Cursor tokens are opaque. Never add one, subtract one, or parse it as a number to build the next request — pass back the exact string the server handed you.",
  shortPageNote:
    "A short page does not prove you reached the end. The only reliable signal is the absence of a next link, and even that only describes the response in front of you.",
  duplicateNote:
    "The same identifier appearing twice on one page usually means records moved between pages while you were reading them, not that the collection contains duplicates.",
  missingNote:
    "Records without an identifier cannot be de-duplicated or used as a cursor, so a consumer cannot safely resume from this page.",
  orderNote:
    "Paging tokens are compared as integers here, never as floats: they routinely exceed the range a JavaScript number can represent exactly."
} as const;

export const errorCopy: Record<PaginationErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Paste a response first",
    description: "This tool reads the JSON body of a Horizon collection response."
  },
  input_too_large: {
    title: "That input is too long",
    description:
      "Responses are capped at 512 KiB here. Anything larger is almost certainly a saved file rather than a single Horizon page."
  },
  not_json: {
    title: "That is not valid JSON",
    description:
      "Check for a truncated copy or a stray line from the shell — for example a curl progress line pasted above the body. Horizons responses are JSON objects."
  },
  not_an_object: {
    title: "Valid JSON, but not an object",
    description:
      "The text parsed, but it is an array or a bare value. A Horizon collection response is a JSON object with an _embedded.records array inside it."
  },
  missing_records: {
    title: "No records found in this response",
    description:
      "The object has no _embedded.records. If you pasted a single-resource response, such as an account or a ledger, there are no pages to explain; if you pasted a collection, check that you copied the whole body."
  },
  records_not_an_array: {
    title: "_embedded.records is not an array",
    description:
      "The key exists but does not hold an array, so this is not a Horizon collection envelope. Check that you pasted the response body rather than an error object."
  }
};
