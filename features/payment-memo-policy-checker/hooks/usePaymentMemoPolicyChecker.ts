"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parsePaymentMemoPolicyCheckerInput } from "@/features/payment-memo-policy-checker/schema";
import { runPaymentMemoPolicyChecker } from "@/features/payment-memo-policy-checker/lib/paymentMemoPolicyChecker";
import { toPaymentMemoPolicyCheckerErrorCode } from "@/features/payment-memo-policy-checker/lib/paymentMemoPolicyChecker.errors";
import type { PaymentMemoPolicyCheckerErrorCode, PaymentMemoPolicyCheckerResult } from "@/features/payment-memo-policy-checker/types";

export type PaymentMemoPolicyCheckerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: PaymentMemoPolicyCheckerResult }
  | { status: "error"; code: PaymentMemoPolicyCheckerErrorCode };

export function usePaymentMemoPolicyChecker() {
  const { network } = useNetwork();
  const [state, setState] = useState<PaymentMemoPolicyCheckerState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parsePaymentMemoPolicyCheckerInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<PaymentMemoPolicyCheckerResult, PaymentMemoPolicyCheckerErrorCode> = await runPaymentMemoPolicyChecker(
          parsed.value,
          network,
          next.signal
        );
        if (next.signal.aborted) return;
        setState(
          result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code }
        );
      } catch (error) {
        if (next.signal.aborted) return;
        setState({ status: "error", code: toPaymentMemoPolicyCheckerErrorCode(error) });
      }
    },
    [network]
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
