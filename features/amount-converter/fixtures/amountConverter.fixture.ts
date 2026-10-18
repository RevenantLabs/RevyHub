import { MAX_AMOUNT, MAX_STROOPS } from "@/features/amount-converter/lib/amountConverter";
import type { AmountConverterResult } from "@/features/amount-converter/types";

export const oneStroop: AmountConverterResult = {
  stroops: "1",
  amount: "0.0000001"
};

export const oneXlm: AmountConverterResult = {
  stroops: "10000000",
  amount: "1.0000000"
};

export const maxStroops: AmountConverterResult = {
  stroops: MAX_STROOPS.toString(),
  amount: MAX_AMOUNT
};

export const tooManyDecimals = "1.23456789";
