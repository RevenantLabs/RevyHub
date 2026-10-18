import type { PaymentQrErrorCode } from "@/features/payment-qr/types";

/** Anything not caused by a specific form field is a generation failure. */
export function toPaymentQrErrorCode(error: unknown): PaymentQrErrorCode {
  void error;
  return "qr_generation_failed";
}
