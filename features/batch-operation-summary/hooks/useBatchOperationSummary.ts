"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseBatchOperationSummaryInput } from "@/features/batch-operation-summary/schema";
import { runBatchOperationSummary } from "@/features/batch-operation-summary/lib/batchOperationSummary";
import { toBatchOperationSummaryErrorCode } from "@/features/batch-operation-summary/lib/batchOperationSummary.errors";
import type { BatchOperationSummaryErrorCode, BatchOperationSummaryResult } from "@/features/batch-operation-summary/types";

export type BatchOperationSummaryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: BatchOperationSummaryResult }
  | { status: "error"; code: BatchOperationSummaryErrorCode };

export function useBatchOperationSummary() {
  const { network } = useNetwork();
  const [state, setState] = useState<BatchOperationSummaryState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseBatchOperationSummaryInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<BatchOperationSummaryResult, BatchOperationSummaryErrorCode> = await runBatchOperationSummary(
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
        setState({ status: "error", code: toBatchOperationSummaryErrorCode(error) });
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
