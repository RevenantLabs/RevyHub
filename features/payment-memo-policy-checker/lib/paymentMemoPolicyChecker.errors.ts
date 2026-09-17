import { classifyHorizonError } from "@/core/horizon/errors";
import type { PaymentMemoPolicyCheckerErrorCode } from "@/features/payment-memo-policy-checker/types";

/** Maps transport failures onto this tool's own error codes. */
export function toPaymentMemoPolicyCheckerErrorCode(error: unknown): PaymentMemoPolicyCheckerErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "not_found" ? "not_found" : "request_failed";
}
