import { err, ok, type Result } from "@/core/result/result";
import type { PathPaymentSlippageCalculatorErrorCode, PathPaymentRecord } from "@/features/path-payment-slippage-calculator/types";
export function declaredBound(record: PathPaymentRecord): Result<{ direction: "minimum-destination" | "maximum-send"; amount: string }, PathPaymentSlippageCalculatorErrorCode> {
  if (!record.declaredBound) return err("malformed_effect");
  return ok({ direction: record.variant === "strict-send" ? "minimum-destination" : "maximum-send", amount: record.declaredBound });
}
