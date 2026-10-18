import type { AmountConverterErrorCode } from "@/features/amount-converter/types";

/** Maps unexpected runtime failures onto this tool's own error codes. */
export function toAmountConverterErrorCode(_error: unknown): AmountConverterErrorCode {
  return "invalid_amount";
}
