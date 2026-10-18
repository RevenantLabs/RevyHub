import type { ErrorCode } from "./types";
export const copy = {
  "noIntersection":"No intersection",
  "unknownRetention":"Retention not supplied",
  "retainedClass":"Retained",
  "olderClass":"Older than retention",
  "futureClass":"Beyond latest",
  "mixedClass":"Mixed retention",
  "title": "Ledger Range and Retention Planner",
  "description": "Split an inclusive ledger range into bounded chunks. Retention is a supplied assumption, not live provider state. Choose explicitly whether to export the requested range or only its retained intersection.",
  "submit": "Analyze",
  "loading": "Analyzing…",
  "reset": "Reset",
  "emptyTitle": "Ready to inspect",
  "emptyDescription": "Split an inclusive ledger range into bounded chunks. Retention is a supplied assumption, not live provider state. Choose explicitly whether to export the requested range or only its retained intersection.",
  "resultTitle": "Analysis result",
  "report": "Local JSON report",
  "download": "Download JSON report",
  "noRows": "No matching rows",
  "all": "All rows",
  "filter": "Filter results",
  "rejected": "Sensitive input discarded. Enter only public data.",
  "fields": {
    "start": {
      "label": "Start ledger",
      "hint": "Positive uint32, inclusive."
    },
    "end": {
      "label": "End ledger",
      "hint": "Positive uint32, inclusive."
    },
    "chunk": {
      "label": "Maximum ledgers per chunk",
      "hint": "Positive uint32; no more than 1000 generated rows."
    },
    "oldest": {
      "label": "Oldest retained ledger",
      "hint": "Optional positive uint32; supply with latest retained ledger."
    },
    "latest": {
      "label": "Latest retained ledger",
      "hint": "Optional positive uint32; supply with oldest retained ledger."
    },
    "scope": {
      "label": "Export scope",
      "hint": "Requested range is the default. Retained intersection requires an explicit selection.",
      "options": [
        "Requested range",
        "Retained intersection"
      ],
      "default": "Requested range"
    }
  },
  "labels": {
    "requested": "Requested inclusive range",
    "selected": "Selected export range",
    "assumption": "Retention assumption",
    "chunks": "Total chunk count",
    "start": "Start ledger",
    "end": "End ledger",
    "count": "Ledger count",
    "classification": "Retention classification",
    "retained": "Retained intersection",
    "older": "Older than retention",
    "future": "Beyond latest ledger"
  }
} as const;
export const errorCopy: Record<ErrorCode,{title:string;description:string}> = {
  "empty_input": {
    "title": "Empty input",
    "description": "Enter start, end and chunk size."
  },
  "invalid_input": {
    "title": "Invalid input",
    "description": "Use positive uint32 integers between 1 and 4294967295."
  },
  "input_too_large": {
    "title": "Input too large",
    "description": "Keep each input within 40 characters."
  },
  "reversed_range": {
    "title": "Reversed range",
    "description": "Set the start ledger at or before the end ledger."
  },
  "invalid_retention": {
    "title": "Invalid retention",
    "description": "Provide both retention bounds in increasing order; an intersection export requires a retention window."
  },
  "too_many_chunks": {
    "title": "Too many chunks",
    "description": "The plan exceeds 1000 rows. Increase chunk size or narrow the interval; the error details show the exact total."
  }
};
