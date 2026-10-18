import { classifyHorizonError } from "@/core/horizon/errors";
import type { PaymentReceiptReconcilerErrorCode } from "@/features/payment-receipt-reconciler/types";

/** Maps transport failures onto this tool's own error codes. */
export function toPaymentReceiptReconcilerErrorCode(
  error: unknown
): PaymentReceiptReconcilerErrorCode {
  const { code } = classifyHorizonError(error);
  if (code === "not_found") return "transaction_not_found";
  return "request_failed";
}
