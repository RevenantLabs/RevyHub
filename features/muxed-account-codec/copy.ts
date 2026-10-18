import type { ErrorCode } from "./types";
export const copy = {
  "title": "Muxed Account Encoder and Decoder",
  "description": "Convert between an M address and its G account plus exact uint64 routing ID. Both refer to the same ledger account; the ID provides routing, not a separate balance.",
  "submit": "Analyze",
  "loading": "Analyzing…",
  "reset": "Reset",
  "emptyTitle": "Ready to inspect",
  "emptyDescription": "Convert between an M address and its G account plus exact uint64 routing ID. Both refer to the same ledger account; the ID provides routing, not a separate balance.",
  "resultTitle": "Analysis result",
  "report": "Local JSON report",
  "noRows": "No matching rows",
  "all": "All rows",
  "filter": "Filter results",
  "rejected": "Sensitive input discarded. Enter only public data.",
  "fields": {
    "mode": {
      "label": "Conversion mode",
      "hint": "Choose which direction to convert.",
      "options": [
        "Decode",
        "Encode"
      ],
      "default": "Decode"
    },
    "muxed": {
      "label": "M address",
      "hint": "Used in Decode mode; enter a public muxed account."
    },
    "base": {
      "label": "G address",
      "hint": "Used in Encode mode; enter the underlying public account."
    },
    "id": {
      "label": "Multiplexing ID",
      "hint": "Encode mode: unsigned integer from 0 to 18446744073709551615."
    }
  },
  "labels": {
    "muxed": "M address",
    "base": "G account",
    "id": "Multiplexing ID",
    "note": "Account relationship"
  }
} as const;
export const errorCopy: Record<ErrorCode,{title:string;description:string}> = {
  "empty_input": {
    "title": "Empty input",
    "description": "Provide the address required by the selected mode."
  },
  "invalid_muxed_address": {
    "title": "Invalid muxed address",
    "description": "Use a checksum-valid M address; secret seeds are discarded."
  },
  "invalid_base_address": {
    "title": "Invalid base address",
    "description": "Use a checksum-valid G public address; never provide a secret seed."
  },
  "invalid_id": {
    "title": "Invalid id",
    "description": "Enter an unsigned decimal integer between 0 and 18446744073709551615."
  }
};
