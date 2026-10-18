import type { AmountConverterErrorCode, AmountConverterField } from "@/features/amount-converter/types";

export const copy = {
  stroopsLabel: "Stroops",
  stroopsHint: "Whole stroops only — 10,000,000 stroops equal 1 XLM.",
  amountLabel: "Display amount",
  amountHint: "Up to seven decimal places, matching Horizon balance strings.",
  maxExample: "Load int64 maximum",
  maxExampleHint: "9223372036854775807 stroops — the largest value Stellar stores.",
  submit: "Clear",
  emptyTitle: "No conversion yet",
  emptyDescription:
    "Edit either field above. Conversion runs instantly in your browser with exact integer arithmetic — no request leaves this page.",
  resultTitle: "Conversion",
  resultStroops: "Stroops",
  resultAmount: "Display amount",
  exactConversion: "Exact conversion"
} as const;

export const errorCopy: Record<
  AmountConverterErrorCode,
  { title: string; description: string; field?: AmountConverterField }
> = {
  empty_input: {
    title: "Enter a value first",
    description: "Type a stroop count or a display amount to convert."
  },
  invalid_amount: {
    title: "That value is not a valid number",
    description:
      "Stroops must be a whole number. Display amounts use digits and at most one decimal point."
  },
  too_many_decimals: {
    title: "Too many decimal places",
    description:
      "Stellar stores at most seven decimal places (one stroop). Extra digits would be lost — shorten the amount or round it yourself before converting.",
    field: "amount"
  },
  out_of_range: {
    title: "Outside the int64 stroop range",
    description:
      "Stellar amounts are signed 64-bit integers in stroops. The maximum is 9,223,372,036,854,775,807 stroops (922337203685.4775807 XLM)."
  },
  negative_not_allowed: {
    title: "Negative values are not supported",
    description: "Enter zero or a positive stroop count or display amount."
  }
};
