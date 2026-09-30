"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseTransactionTimeboundPlannerInput } from "@/features/transaction-timebound-planner/schema";
import { runTransactionTimeboundPlanner } from "@/features/transaction-timebound-planner/lib/transactionTimeboundPlanner";
import { toTransactionTimeboundPlannerErrorCode } from "@/features/transaction-timebound-planner/lib/transactionTimeboundPlanner.errors";
import type { TransactionTimeboundPlannerErrorCode, TransactionTimeboundPlannerResult } from "@/features/transaction-timebound-planner/types";

export type TransactionTimeboundPlannerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: TransactionTimeboundPlannerResult }
  | { status: "error"; code: TransactionTimeboundPlannerErrorCode };

export function useTransactionTimeboundPlanner() {
  const { network } = useNetwork();
  const [state, setState] = useState<TransactionTimeboundPlannerState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseTransactionTimeboundPlannerInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<TransactionTimeboundPlannerResult, TransactionTimeboundPlannerErrorCode> = await runTransactionTimeboundPlanner(
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
        setState({ status: "error", code: toTransactionTimeboundPlannerErrorCode(error) });
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
