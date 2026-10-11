"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseSorobanFeeEstimatorInput } from "@/features/soroban-fee-estimator/schema";
import { runSorobanFeeEstimator } from "@/features/soroban-fee-estimator/lib/sorobanFeeEstimator";
import { toSorobanFeeEstimatorErrorCode } from "@/features/soroban-fee-estimator/lib/sorobanFeeEstimator.errors";
import type { SorobanFeeEstimatorErrorCode, SorobanFeeEstimatorResult } from "@/features/soroban-fee-estimator/types";

export type SorobanFeeEstimatorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: SorobanFeeEstimatorResult }
  | { status: "error"; code: SorobanFeeEstimatorErrorCode };

export function useSorobanFeeEstimator() {
  const { network } = useNetwork();
  const [state, setState] = useState<SorobanFeeEstimatorState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseSorobanFeeEstimatorInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<SorobanFeeEstimatorResult, SorobanFeeEstimatorErrorCode> = await runSorobanFeeEstimator(
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
        setState({ status: "error", code: toSorobanFeeEstimatorErrorCode(error) });
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
