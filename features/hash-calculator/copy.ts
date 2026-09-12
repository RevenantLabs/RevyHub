import type { HashCalculatorErrorCode } from "@/features/hash-calculator/types";

/** User-facing static copy for the Hash Calculator feature slice. */
export const copy = {
  formModeLabel: "Calculator Mode",
  modeData: "Raw Data (SHA-256)",
  modeTransaction: "Transaction Envelope (XDR)",
  encodingLabel: "Data Encoding",
  encodingUtf8: "UTF-8 Text",
  encodingHex: "Hexadecimal",
  encodingBase64: "Base64",
  dataLabel: "Input Data",
  dataHint: "Enter text, hex, or base64 data to compute its SHA-256 digest.",
  dataPlaceholder: "Enter data to hash...",
  envelopeLabel: "Transaction Envelope (XDR)",
  envelopeHint: "Paste a base64-encoded Stellar transaction envelope.",
  envelopePlaceholder: "AAAAAgAAAADwJhfODukQ...",
  passphraseLabel: "Network Passphrase",
  passphraseHint: "Select a network passphrase preset or provide a custom one.",
  presetTestnet: "Testnet",
  presetPublic: "Public / Mainnet",
  presetCustom: "Custom",
  customPassphraseLabel: "Custom Network Passphrase",
  customPassphrasePlaceholder: "e.g. Standalone Network ; February 2017",
  customPassphraseHint: "Enter the exact network passphrase required for hash derivation.",
  submit: "Compute Hash",
  submitting: "Computing...",
  emptyTitle: "No hash computed yet",
  emptyDescription:
    "Enter raw data or paste a transaction envelope and passphrase to calculate cryptographic hashes.",
  resultTitle: "Cryptographic Hash",
  resultDataTitle: "SHA-256 Digest",
  resultTxTitle: "Derived Transaction Hash",
  hexLabel: "Hexadecimal",
  base64Label: "Base64",
  inputSizeLabel: "Input Size",
  inputEncodingLabel: "Input Encoding",
  networkLabel: "Network Passphrase",
  envelopeTypeLabel: "Envelope Type",
  operationsLabel: "Operations Count",
  comparisonTitle: "Passphrase Impact Comparison",
  comparisonDescription:
    "Stellar transaction hashes are derived from SHA-256(networkPassphrase + ENVELOPE_TYPE_TX + tx). The exact same envelope produces distinct hashes on Testnet and Mainnet to prevent replay attacks across networks.",
  testnetHashLabel: "Testnet Hash",
  publicHashLabel: "Mainnet Hash",
  switchToTestnet: "Switch to Testnet",
  switchToPublic: "Switch to Mainnet",
  activeBadge: "Active Passphrase",
  copyHexLabel: "hex hash",
  copyBase64Label: "base64 hash"
} as const;

/** User-facing error titles and actionable instructions for every error code. */
export const errorCopy: Record<
  HashCalculatorErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Input required",
    description: "Enter data or paste an XDR transaction envelope before computing."
  },
  invalid_encoding: {
    title: "Invalid encoding",
    description:
      "The input cannot be decoded under the selected encoding. Provide an even number of hexadecimal digits or valid padded base64 text."
  },
  invalid_xdr: {
    title: "Invalid transaction envelope",
    description:
      "The pasted text does not decode as a valid Stellar transaction envelope. Ensure the entire base64 string was copied without missing characters or secret keys."
  },
  empty_passphrase: {
    title: "Network passphrase required",
    description: "Provide a custom network passphrase or choose a standard network preset."
  },
  crypto_unavailable: {
    title: "Web Crypto unavailable",
    description:
      "The current execution environment does not expose crypto.subtle.digest. Run in a modern browser or environment with Web Crypto enabled."
  },
  request_failed: {
    title: "Calculation failed",
    description: "An unexpected error occurred during hash computation. Check your inputs and try again."
  }
};
