"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseLiquidityPoolCalculatorInput } from "@/features/liquidity-pool-calculator/schema";
import { runLiquidityPoolCalculator } from "@/features/liquidity-pool-calculator/lib/liquidityPoolCalculator";
import { toLiquidityPoolCalculatorErrorCode } from "@/features/liquidity-pool-calculator/lib/liquidityPoolCalculator.errors";
import type { LiquidityPoolCalculatorErrorCode, LiquidityPoolCalculatorResult } from "@/features/liquidity-pool-calculator/types";

export type LiquidityPoolCalculatorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: LiquidityPoolCalculatorResult }
  | { status: "error"; code: LiquidityPoolCalculatorErrorCode };

export function useLiquidityPoolCalculator() {
  const { network } = useNetwork();
  const [state, setState] = useState<LiquidityPoolCalculatorState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseLiquidityPoolCalculatorInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<LiquidityPoolCalculatorResult, LiquidityPoolCalculatorErrorCode> = await runLiquidityPoolCalculator(
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
        setState({ status: "error", code: toLiquidityPoolCalculatorErrorCode(error) });
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
