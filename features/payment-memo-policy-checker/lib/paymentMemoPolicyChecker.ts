import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { PaymentMemoPolicyCheckerErrorCode, PaymentMemoPolicyCheckerInput, PaymentMemoPolicyCheckerResult } from "@/features/payment-memo-policy-checker/types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runPaymentMemoPolicyChecker(
  input: PaymentMemoPolicyCheckerInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<PaymentMemoPolicyCheckerResult, PaymentMemoPolicyCheckerErrorCode>> {
  return ok({ summary: input.value });
}
