import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { PaymentMemoPolicyCheckerErrorCode, PaymentMemoPolicyCheckerInput } from "@/features/payment-memo-policy-checker/types";

/** Parses raw form input into a validated request, without throwing. */
export function parsePaymentMemoPolicyCheckerInput(raw: string): Result<PaymentMemoPolicyCheckerInput, PaymentMemoPolicyCheckerErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  return ok({ value });
}
