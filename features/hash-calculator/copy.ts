import type { ErrorCode } from "./types";
export const copy = {
  "title": "Stellar Hash Calculator",
  "description": "Hash UTF-8, hex or base64 bytes with SHA-256, or derive a transaction hash from envelope XDR and an explicit network passphrase. Changing the passphrase changes transaction hashes; recompute after each edit.",
  "submit": "Analyze",
  "loading": "Analyzing…",
  "reset": "Reset",
  "emptyTitle": "Ready to inspect",
  "emptyDescription": "Hash UTF-8, hex or base64 bytes with SHA-256, or derive a transaction hash from envelope XDR and an explicit network passphrase. Changing the passphrase changes transaction hashes; recompute after each edit.",
  "resultTitle": "Analysis result",
  "report": "Local JSON report",
  "download": "Download JSON report",
  "noRows": "No matching rows",
  "all": "All rows",
  "filter": "Filter results",
  "rejected": "Sensitive input discarded. Enter only public data.",
  "fields": {
    "mode": {
      "label": "Hash mode",
      "hint": "Select raw bytes or transaction-envelope hashing.",
      "options": [
        "SHA-256",
        "Transaction"
      ],
      "default": "SHA-256"
    },
    "encoding": {
      "label": "Byte encoding",
      "hint": "Used for SHA-256 mode. Transaction mode always expects base64 XDR.",
      "options": [
        "UTF-8",
        "Hex",
        "Base64"
      ],
      "default": "UTF-8"
    },
    "value": {
      "label": "Input data",
      "hint": "Maximum 262144 characters. Never paste secret keys.",
      "multiline": true
    },
    "network": {
      "label": "Network passphrase",
      "hint": "Used for transaction hashing; this is independent of the header switch.",
      "options": [
        "Testnet",
        "Mainnet",
        "Custom"
      ],
      "default": "Testnet"
    },
    "passphrase": {
      "label": "Custom passphrase",
      "hint": "Custom network only; exact whitespace matters, maximum 1024 characters."
    }
  },
  "labels": {
    "hex": "SHA-256 / transaction hash (hex)",
    "base64": "SHA-256 / transaction hash (base64)",
    "bytes": "Hashed input byte length",
    "passphrase": "Transaction network passphrase",
    "mode": "Hash mode"
  }
} as const;
export const errorCopy: Record<ErrorCode,{title:string;description:string}> = {
  "empty_input": {
    "title": "Empty input",
    "description": "Enter data to hash; this workbench requires a nonempty input."
  },
  "invalid_encoding": {
    "title": "Invalid encoding",
    "description": "Use valid UTF-8 text, even-length hex, or canonical padded base64. Keep data within 262144 characters and custom passphrases within 1024."
  },
  "invalid_xdr": {
    "title": "Invalid xdr",
    "description": "Paste a complete base64 transaction envelope without trailing bytes."
  },
  "empty_passphrase": {
    "title": "Empty passphrase",
    "description": "Enter the exact custom network passphrase before deriving its transaction hash."
  },
  "crypto_unavailable": {
    "title": "Crypto unavailable",
    "description": "SHA-256 requires Web Crypto digest. Use a browser with Web Crypto in a secure context."
  }
};
