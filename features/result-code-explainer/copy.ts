import type { ResultCodeExplainerErrorCode } from "@/features/result-code-explainer/types";

export const copy = {
  modeLabel: "Input type",
  modeCode: "Paste code",
  modeXdr: "Result XDR",
  codeLabel: "Result code",
  codeHint:
    "Paste one or more codes separated by commas or new lines — for example tx_failed or payment_underfunded. Everything stays in your browser.",
  codePlaceholder: "tx_failed\npayment_underfunded",
  xdrLabel: "Transaction result XDR",
  xdrHint:
    "Paste base64 transaction-result XDR from Horizon or your SDK. The decoder runs locally and nothing is transmitted.",
  xdrPlaceholder: "AAAAAAAAAGT/////AAAAAQAAAAAAAAAB/////gAAAAA=",
  searchLabel: "Filter explanations",
  searchHint: "Search by code, title, cause or fix.",
  searchPlaceholder: "underfunded",
  submit: "Explain",
  emptyTitle: "No result codes explained yet",
  emptyDescription:
    "Paste a result code or a transaction-result XDR to read what failed, why it failed, and what to check next.",
  resultTitle: "Explanation",
  transactionTitle: "Transaction result",
  operationsTitle: "Operation results",
  referenceTitle: "Matched codes",
  labelFee: "Fee charged",
  labelTransactionCode: "Transaction code",
  labelCategory: "Category",
  labelCause: "Cause",
  labelFix: "What to check",
  unknownNote:
    "This code is not in the curated table. The description above is generic — verify the exact enum in the protocol docs rather than guessing.",
  noMatches: "No explanations match your filter.",
  labelOuterCode: "Operation code",
  labelInnerCode: "Inner result"
} as const;

export const errorCopy: Record<ResultCodeExplainerErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Paste a code or result XDR first",
    description: "Enter at least one result code, or switch to result XDR mode and paste base64 output."
  },
  invalid_base64: {
    title: "That is not valid base64",
    description:
      "Result XDR uses A–Z, a–z, 0–9, + and / with = padding, and its length is a multiple of four. Check for a truncated copy."
  },
  input_too_large: {
    title: "That input is too long",
    description:
      "Result XDR is capped at 65,536 characters here. Anything larger is almost certainly not a single transaction result."
  },
  invalid_xdr: {
    title: "Valid base64, but not a transaction result",
    description:
      "The bytes decoded but are not a well-formed TransactionResult. Make sure you copied result XDR rather than an envelope or ledger entry."
  },
  unknown_code: {
    title: "Code not recognised",
    description:
      "That string is not in the curated table. Try the camelCase or snake_case form from Horizon, or paste the result XDR to decode it."
  }
};
