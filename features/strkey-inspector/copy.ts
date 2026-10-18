import type { ErrorCode } from "./types";
export const copy = {
  "title": "StrKey Type Inspector",
  "description": "Identify supported public Stellar StrKeys and inspect raw bytes offline. Secret seeds are discarded before decoding.",
  "submit": "Analyze",
  "loading": "Analyzing…",
  "reset": "Reset",
  "emptyTitle": "Ready to inspect",
  "emptyDescription": "Identify supported public Stellar StrKeys and inspect raw bytes offline. Secret seeds are discarded before decoding.",
  "resultTitle": "Analysis result",
  "report": "Local JSON report",
  "noRows": "No matching rows",
  "all": "All rows",
  "filter": "Filter results",
  "rejected": "Sensitive input discarded. Enter only public data.",
  "fields": {
    "value": {
      "label": "Public StrKey",
      "hint": "G, M, C, T, X or P identifier. Maximum 1024 characters; never enter an S seed."
    }
  },
  "labels": {
    "kind": "StrKey kind",
    "hex": "Raw payload (hex)",
    "bytes": "Payload byte length",
    "base": "Underlying G account",
    "id": "Multiplexing ID",
    "version": "Version byte"
  }
} as const;
export const errorCopy: Record<ErrorCode,{title:string;description:string}> = {
  "empty_input": {
    "title": "Empty input",
    "description": "Paste a public StrKey identifier."
  },
  "secret_seed_rejected": {
    "title": "Secret seed rejected",
    "description": "The S-prefixed input was discarded. Use a public identifier instead."
  },
  "unknown_prefix": {
    "title": "Unknown prefix",
    "description": "This prefix is unsupported by the installed SDK. Use G, M, C, T, X or P."
  },
  "bad_checksum": {
    "title": "Bad checksum",
    "description": "Check the entire public identifier, including its encoding, length and checksum."
  }
};

export const kindCopy = {G:"Ed25519 public key",M:"Muxed account",C:"Contract",T:"Preauthorized transaction hash",X:"Hash-X signer",P:"Signed-payload signer"} as const;
