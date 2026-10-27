import type { PathPaymentSlippageCalculatorErrorCode } from "@/features/path-payment-slippage-calculator/types";
export function statusToPathPaymentError(status: number): PathPaymentSlippageCalculatorErrorCode {
  if (status === 404) return "transaction_not_found";
  if (status === 429) return "rate_limited";
  return "request_failed";
}
export function toPathPaymentSlippageCalculatorErrorCode(_error: unknown): PathPaymentSlippageCalculatorErrorCode { return "request_failed"; }
