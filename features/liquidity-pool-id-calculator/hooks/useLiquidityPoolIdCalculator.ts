"use client";

import { useCallback, useState } from "react";
import { parseInput } from "../schema";
import { calculateLiquidityPoolId } from "../lib/liquidityPoolIdCalculator";
import { unexpectedFailure } from "../lib/liquidityPoolIdCalculator.errors";
import type { ErrorCode, LiquidityPoolIdResult, RawInput } from "../types";

export type State =
  | { status: "idle" }
  | { status: "success"; result: LiquidityPoolIdResult }
  | { status: "error"; code: ErrorCode };

/** Computation is synchronous and local — this tool never makes a request, see `manifest.ts`'s `offline: true`. */
export function useLiquidityPoolIdCalculator() {
  const [state, setState] = useState<State>({ status: "idle" });

  const submit = useCallback((raw: RawInput) => {
    const parsed = parseInput(raw);
    if (!parsed.ok) {
      setState({ status: "error", code: parsed.code });
      return;
    }
    try {
      const result = calculateLiquidityPoolId(parsed.value);
      setState(result.ok ? { status: "success", result: result.value } : { status: "error", code: result.code });
    } catch {
      setState({ status: "error", code: unexpectedFailure() });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
