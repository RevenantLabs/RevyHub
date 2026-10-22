import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { PathPaymentSlippageCalculatorErrorCode, PathPaymentSlippageCalculatorInput } from "@/features/path-payment-slippage-calculator/types";
export function parsePathPaymentSlippageCalculatorInput(raw: string): Result<PathPaymentSlippageCalculatorInput, PathPaymentSlippageCalculatorErrorCode> {
  const hash = normalizeInput(raw).toLowerCase();
  return /^[0-9a-f]{64}$/.test(hash) ? ok({ hash }) : err("invalid_hash");
}
