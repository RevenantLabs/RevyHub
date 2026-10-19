import type { SigningPayloadInspectorErrorCode } from "@/features/signing-payload-inspector/types";

export const copy = {
  formLabel: "Transaction envelope XDR",
  formHint: "Paste a base64 transaction envelope. Processing stays in this browser.",
  networkLabel: "Network passphrase",
  networkHint: "Choose the network whose passphrase the signer uses. The choice changes both hashes.",
  testnet: "Testnet",
  mainnet: "Mainnet",
  submit: "Inspect signing payload",
  loading: "Computing payload…",
  emptyTitle: "Ready to inspect a signing payload",
  emptyDescription: "Paste a classic or fee-bump envelope to see the network ID, signature base bytes, and hash.",
  resultTitle: "Signing payload",
  networkIdTitle: "Network ID",
  networkIdDescription: "SHA-256 of the selected network passphrase",
  classicTitle: "Classic transaction payload",
  outerTitle: "Outer fee-bump payload",
  innerTitle: "Inner transaction payload",
  feeBumpNote: "The fee payer signs the outer hash; inner transaction signers sign the separate inner hash.",
  signatureBaseTitle: "Signature base bytes (hex)",
  signatureBaseHint: "Network ID (32 bytes) + transaction type tag (4 bytes) + transaction XDR. These are the bytes hashed for signing.",
  payloadHashTitle: "SHA-256 payload hash",
  payloadHashHint: "This 32-byte digest is what the signer signs.",
  variantLabel: "Envelope type",
  networkLabelResult: "Selected network",
  byteLengthLabel: "Signature base length",
  bytesUnit: "bytes",
  variantClassicV0: "Classic v0",
  variantClassicV1: "Classic v1",
  variantFeeBump: "Fee bump",
  tagClassic: "ENVELOPE_TYPE_TX (2)",
  tagFeeBump: "ENVELOPE_TYPE_TX_FEE_BUMP (5)",
  tagLabel: "Signature tag"
} as const;

export const errorCopy: Record<SigningPayloadInspectorErrorCode, { title: string; description: string }> = {
  empty_xdr: {
    title: "Paste an envelope first",
    description: "Copy the complete base64 transaction envelope XDR into the field and try again."
  },
  invalid_xdr: {
    title: "That is not a valid transaction envelope",
    description: "Paste a complete base64 transaction envelope XDR, without a transaction hash or JSON wrapper."
  },
  unsupported_envelope: {
    title: "This envelope type is not supported",
    description: "Use a classic v0, classic v1, or fee-bump transaction envelope."
  },
  too_large: {
    title: "The pasted XDR is too large",
    description: "Use an envelope of 65,536 characters or fewer, including whitespace."
  }
};
