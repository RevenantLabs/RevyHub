import { err, ok, type Result } from "@/core/result/result";
import type { PathPaymentSlippageCalculatorErrorCode, PathVariant } from "@/features/path-payment-slippage-calculator/types";
function units(value: string): bigint | null {
  if (!/^\d+(?:\.\d{1,7})?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 10_000_000n + BigInt(fraction.padEnd(7, "0"));
}
export function calculateSlippageBasisPoints(variant: PathVariant, bound: string, actual: string): Result<string, PathPaymentSlippageCalculatorErrorCode> {
  const boundUnits = units(bound); const actualUnits = units(actual);
  if (boundUnits === null || actualUnits === null || boundUnits === 0n) return err("malformed_effect");
  const delta = variant === "strict-send" ? actualUnits - boundUnits : boundUnits - actualUnits;
  return ok(((delta * 10_000n) / boundUnits).toString());
}
