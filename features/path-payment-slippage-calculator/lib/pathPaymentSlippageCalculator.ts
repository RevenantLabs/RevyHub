import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { extractPathPayment } from "@/features/path-payment-slippage-calculator/lib/path-payment-extract";
import { calculateSlippageBasisPoints } from "@/features/path-payment-slippage-calculator/lib/slippage-math";
import { statusToPathPaymentError } from "@/features/path-payment-slippage-calculator/lib/pathPaymentSlippageCalculator.errors";
import type { PathPaymentSlippageCalculatorErrorCode, PathPaymentSlippageCalculatorInput, PathPaymentSlippageCalculatorResult } from "@/features/path-payment-slippage-calculator/types";
export async function runPathPaymentSlippageCalculator(input: PathPaymentSlippageCalculatorInput, network: StellarNetwork, signal?: AbortSignal): Promise<Result<PathPaymentSlippageCalculatorResult, PathPaymentSlippageCalculatorErrorCode>> {
  const response = await fetch(horizonUrl(network, `/transactions/${input.hash}/operations`, { limit: 200 }), { signal });
  if (!response.ok) return err(statusToPathPaymentError(response.status));
  const page = await response.json() as { _embedded?: { records?: unknown[] } };
  const extracted = extractPathPayment((page._embedded?.records ?? []) as never[]);
  if (!extracted.ok) return extracted;
  const slippage = calculateSlippageBasisPoints(extracted.value.variant, extracted.value.declaredBound, extracted.value.actualAmount);
  if (!slippage.ok) return slippage;
  return ok({ ...extracted.value, network, slippageBasisPoints: slippage.value });
}
