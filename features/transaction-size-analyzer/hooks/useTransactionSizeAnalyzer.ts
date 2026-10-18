"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseSizeInput, type RawSizeInput } from "@/features/transaction-size-analyzer/schema";
import { analyzeSize } from "@/features/transaction-size-analyzer/lib/transactionSize";
import type { SizeErrorCode, SizeReport } from "@/features/transaction-size-analyzer/types";

export type TransactionSizeAnalyzerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; report: SizeReport }
  | { status: "error"; code: SizeErrorCode };

/**
 * Measuring is synchronous and local. The loading state exists because the
 * contract requires all four, and it is entered and left within the same
 * update so no artificial delay is ever shown.
 */
export function useTransactionSizeAnalyzer() {
  const [state, setState] = useState<TransactionSizeAnalyzerState>({ status: "idle" });

  const submit = useCallback((raw: RawSizeInput) => {
    setState({ status: "loading" });

    const parsed = parseSizeInput(raw);

    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = analyzeSize(parsed.value);
    setState(
      result.ok
        ? { status: "success", report: result.value }
        : { status: "error", code: result.code }
    );
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
