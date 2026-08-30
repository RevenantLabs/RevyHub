import { err, ok, type Result } from "@/core/result/result";
import { amountToStroops, stroopsToAmount } from "@/features/amount-converter/lib/format";
import type { AmountConverterErrorCode, AmountConverterResult } from "@/features/amount-converter/types";

export const MAX_STROOPS = 9_223_372_036_854_775_807n;
export const MAX_AMOUNT = "922337203685.4775807";

const STROOPS_INTEGER = /^\d+$/;
const AMOUNT = /^(0|[1-9]\d*)(?:\.(\d+))?$/;
const MAX_DECIMALS = 7;

function outOfRange(): Result<never, AmountConverterErrorCode> {
  return err("out_of_range");
}

function validateStroopsRange(stroops: bigint): Result<bigint, AmountConverterErrorCode> {
  if (stroops < 0n) return err("negative_not_allowed");
  if (stroops > MAX_STROOPS) return outOfRange();
  return ok(stroops);
}

/** Converts a stroop string into the paired display amount. */
export function convertFromStroops(raw: string): Result<AmountConverterResult, AmountConverterErrorCode> {
  const value = raw.trim();
  if (!value) return err("empty_input");
  if (value.startsWith("-")) return err("negative_not_allowed");
  if (!STROOPS_INTEGER.test(value)) return err("invalid_amount");

  let stroops: bigint;
  try {
    stroops = BigInt(value);
  } catch {
    return err("invalid_amount");
  }

  const range = validateStroopsRange(stroops);
  if (!range.ok) return range;

  return ok({
    stroops: stroops.toString(),
    amount: stroopsToAmount(stroops)
  });
}

/** Converts a seven-decimal display amount into the paired stroop string. */
export function convertFromAmount(raw: string): Result<AmountConverterResult, AmountConverterErrorCode> {
  const value = raw.trim();
  if (!value) return err("empty_input");
  if (value.startsWith("-")) return err("negative_not_allowed");

  const match = AMOUNT.exec(value);
  if (!match) return err("invalid_amount");

  const fraction = match[2] ?? "";
  if (fraction.length > MAX_DECIMALS) return err("too_many_decimals");

  let stroops: bigint;
  try {
    stroops = amountToStroops(`${match[1]}${fraction ? `.${fraction}` : ""}`);
  } catch {
    return err("invalid_amount");
  }

  const range = validateStroopsRange(stroops);
  if (!range.ok) return range;

  return ok({
    stroops: stroops.toString(),
    amount: stroopsToAmount(stroops)
  });
}

/** Loads the int64 maximum as a canonical conversion example. */
export function maxStroopExample(): AmountConverterResult {
  return {
    stroops: MAX_STROOPS.toString(),
    amount: MAX_AMOUNT
  };
}
