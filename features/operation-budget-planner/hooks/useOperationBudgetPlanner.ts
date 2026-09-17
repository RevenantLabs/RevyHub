"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseOperationBudgetPlannerInput } from "@/features/operation-budget-planner/schema";
import { runOperationBudgetPlanner } from "@/features/operation-budget-planner/lib/operationBudgetPlanner";
import { toOperationBudgetPlannerErrorCode } from "@/features/operation-budget-planner/lib/operationBudgetPlanner.errors";
import type { OperationBudgetPlannerErrorCode, OperationBudgetPlannerResult } from "@/features/operation-budget-planner/types";

export type OperationBudgetPlannerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: OperationBudgetPlannerResult }
  | { status: "error"; code: OperationBudgetPlannerErrorCode };

export function useOperationBudgetPlanner() {
  const { network } = useNetwork();
  const [state, setState] = useState<OperationBudgetPlannerState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseOperationBudgetPlannerInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<OperationBudgetPlannerResult, OperationBudgetPlannerErrorCode> = await runOperationBudgetPlanner(
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
        setState({ status: "error", code: toOperationBudgetPlannerErrorCode(error) });
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
