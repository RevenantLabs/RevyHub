import type {
  EnvelopeKind,
  SectionKey,
  SizeErrorCode
} from "@/features/transaction-size-analyzer/types";

export const copy = {
  envelopeLabel: "Transaction envelope XDR",
  envelopeHint:
    "Paste base64 envelope XDR. Everything is measured in your browser — nothing is sent anywhere.",
  budgetLabel: "Byte budget (optional)",
  budgetHint:
    "A whole number of XDR bytes to compare against. Leave blank to see the measurement alone.",
  submit: "Measure envelope",

  emptyTitle: "No envelope measured yet",
  emptyDescription:
    "Paste a base64 transaction envelope to see what it actually weighs in XDR bytes, and which operations and signatures account for them.",

  totalsTitle: "Totals",
  outerTitle: "Outer envelope",
  innerTitle: "Inner transaction",
  operationsTitle: "Per operation",
  signaturesTitle: "Per signature",
  budgetTitle: "Budget",

  labelKind: "Envelope kind",
  labelTotalBytes: "XDR bytes",
  labelNormalizedBase64: "Base64 length (normalized)",
  labelPastedBase64: "Base64 length (as pasted)",
  labelOperationCount: "Operations",
  labelSignatureCount: "Signatures",
  labelBudget: "Budget",
  labelHeadroom: "Headroom",
  labelOverage: "Over budget by",
  labelSectionTotal: "Measured total",

  base64Note:
    "Base64 is presentation, not payload. Every three XDR bytes become four base64 characters, so the string is always about a third longer than what the network carries. The XDR byte count is the real number.",
  sumNote:
    "Every section above is an additive slice of the measured total, and the tool checks that they sum to it exactly before showing them.",
  innerNote:
    "The inner transaction is counted once, as a single section of the outer envelope, and then broken down inside its own section — it is not added twice.",
  unsupportedBreakdownTitle: "This envelope could not be broken down safely",
  unsupportedBreakdownDescription:
    "The measured total below is exact, but the sections did not add up to it, so they are withheld rather than shown as an approximation. This usually means the envelope uses a variant this tool does not yet itemise.",
  budgetOkTitle: "Within budget",
  budgetOverTitle: "Over budget",
  budgetNote:
    "A budget is your own limit, not a network guarantee. Whether a transaction is accepted depends on protocol limits, resource fees for Soroban and ledger conditions at the time — none of which can be read from a payload size.",
  noOperations: "This transaction declares no operations.",
  noSignatures: "This layer carries an empty signature vector.",

  copyTotal: "measured XDR byte count"
} as const;

export const sectionLabels: Record<SectionKey, string> = {
  envelope_discriminant: "Envelope type discriminant",
  fee_bump_body: "Fee-bump body (fee source, fee, extension)",
  inner_envelope: "Inner envelope (counted once)",
  inner_discriminant: "Inner envelope discriminant",
  transaction_body: "Transaction body (source, sequence, fee, memo, preconditions)",
  operations: "Operations vector",
  signatures: "Signatures vector"
};

export const kindLabels: Record<EnvelopeKind, string> = {
  "classic-v0": "Classic transaction (v0 envelope)",
  "classic-v1": "Classic transaction (v1 envelope)",
  "fee-bump": "Fee-bump transaction"
};

export const errorCopy: Record<SizeErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Paste an envelope first",
    description: "This tool measures base64 transaction-envelope XDR."
  },
  invalid_input: {
    title: "That is not valid base64",
    description:
      "Envelope XDR uses A-Z, a-z, 0-9, + and / with = padding, and its length is a multiple of four. Check for a truncated copy. A secret key is refused outright."
  },
  input_too_large: {
    title: "That input is too long",
    description:
      "Envelope XDR is capped at 65,536 characters here. Anything larger is almost certainly not a single transaction envelope."
  },
  invalid_xdr: {
    title: "Valid base64, but not a transaction envelope",
    description:
      "The bytes decoded but are not a well-formed envelope. Make sure you copied transaction-envelope XDR rather than another XDR type such as a ledger entry or a transaction result."
  },
  invalid_budget: {
    title: "The budget must be a whole number of bytes",
    description:
      "Enter digits only — a positive whole number up to 10,000,000. Decimals, scientific notation and separators are refused rather than rounded into a budget you did not choose. Leave the field blank for no budget."
  }
};
