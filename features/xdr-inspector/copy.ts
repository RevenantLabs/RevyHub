import type { XdrErrorCode } from "@/features/xdr-inspector/types";

export const copy = {
  formLabel: "Transaction envelope XDR",
  formHint:
    "Paste base64 envelope XDR. Everything is decoded in your browser — nothing is sent anywhere, and this tool never signs or submits.",
  submit: "Inspect envelope",
  emptyTitle: "No envelope inspected yet",
  emptyDescription:
    "Paste a base64 transaction envelope to read its source, fee, sequence, preconditions, memo and operations.",
  summaryTitle: "Transaction",
  preconditionsTitle: "Preconditions",
  operationsTitle: "Operations",
  feeBumpTitle: "Fee-bump wrapper",
  feeBumpExplainer:
    "A fee bump wraps an existing transaction so another account can pay for it. The details above describe the inner transaction — the one that actually executes.",
  expiredTitle: "The time bounds on this transaction have already passed",
  expiredDescription:
    "It can no longer be included in a ledger. A new transaction has to be built.",
  signatureNote:
    "Signatures are counted, not verified. An envelope carries no network passphrase, and the same XDR produces a different signature base on testnet and mainnet, so a signature cannot be checked without knowing which network it was built for.",
  noPreconditions: "This transaction declares no preconditions, so it stays valid indefinitely.",
  labelVariant: "Envelope type",
  labelSource: "Source account",
  labelSequence: "Sequence number",
  labelFee: "Fee",
  labelMemo: "Memo",
  labelSignatures: "Signatures",
  labelTimeBounds: "Time bounds",
  labelLedgerBounds: "Ledger bounds",
  labelMinSeqNumber: "Minimum sequence number",
  labelMinSeqAge: "Minimum sequence age",
  labelMinSeqGap: "Minimum sequence ledger gap",
  labelExtraSigners: "Extra signers",
  labelFeeSource: "Fee paid by",
  labelTotalFee: "Total fee",
  labelOuterSignatures: "Outer signatures"
} as const;

export const errorCopy: Record<XdrErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Paste an envelope first",
    description: "This tool reads base64 transaction-envelope XDR."
  },
  input_too_large: {
    title: "That input is too long",
    description:
      "Envelope XDR is capped at 65,536 characters here. Anything larger is almost certainly not a single transaction envelope."
  },
  invalid_base64: {
    title: "That is not valid base64",
    description:
      "Envelope XDR uses A-Z, a-z, 0-9, + and / with = padding, and its length is a multiple of four. Check for a truncated copy."
  },
  malformed_envelope: {
    title: "Valid base64, but not a transaction envelope",
    description:
      "The bytes decoded but are not a well-formed envelope. Make sure you copied transaction-envelope XDR rather than another XDR type such as a ledger entry or a transaction result."
  },
  unsupported_envelope: {
    title: "This envelope type is not supported",
    description:
      "The envelope decoded but is a variant this inspector does not read — for example a fee bump wrapping something other than a v1 transaction."
  }
};
