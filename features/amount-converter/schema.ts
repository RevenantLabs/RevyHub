import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { AmountConverterErrorCode, AmountConverterField } from "@/features/amount-converter/types";

export interface RawAmountConverterForm {
  stroops: string;
  amount: string;
}

/** Parses raw form input for the field the user edited. */
export function parseAmountConverterField(
  field: AmountConverterField,
  raw: string
): Result<string, AmountConverterErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  return ok(value);
}
