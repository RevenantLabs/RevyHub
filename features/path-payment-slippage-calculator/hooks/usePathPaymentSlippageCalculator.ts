"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parsePathPaymentSlippageCalculatorInput } from "@/features/path-payment-slippage-calculator/schema";
import { runPathPaymentSlippageCalculator } from "@/features/path-payment-slippage-calculator/lib/pathPaymentSlippageCalculator";
import { toPathPaymentSlippageCalculatorErrorCode } from "@/features/path-payment-slippage-calculator/lib/pathPaymentSlippageCalculator.errors";
import type { PathPaymentSlippageCalculatorErrorCode, PathPaymentSlippageCalculatorResult } from "@/features/path-payment-slippage-calculator/types";

export type PathPaymentSlippageCalculatorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: PathPaymentSlippageCalculatorResult }
  | { status: "error"; code: PathPaymentSlippageCalculatorErrorCode };

export function usePathPaymentSlippageCalculator() {
  const { network } = useNetwork();
  const [state, setState] = useState<PathPaymentSlippageCalculatorState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parsePathPaymentSlippageCalculatorInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<PathPaymentSlippageCalculatorResult, PathPaymentSlippageCalculatorErrorCode> = await runPathPaymentSlippageCalculator(
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
        setState({ status: "error", code: toPathPaymentSlippageCalculatorErrorCode(error) });
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
