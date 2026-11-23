"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import { reconcileTransactionBalanceChanges } from "@/features/transaction-balance-change-reconciler/lib/transactionBalanceChangeReconciler";
import {
  parseTransactionBalanceChangeReconcilerInput,
  type RawReconcilerInput
} from "@/features/transaction-balance-change-reconciler/schema";
import type {
  TransactionBalanceChangeReconcilerErrorCode,
  TransactionBalanceChangeReconcilerResult
} from "@/features/transaction-balance-change-reconciler/types";

export type TransactionBalanceChangeReconcilerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: TransactionBalanceChangeReconcilerResult }
  | { status: "error"; code: TransactionBalanceChangeReconcilerErrorCode };

/**
 * Reconciliation is synchronous and local. The loading state exists because
 * the contract requires all four UI states, and it is entered and left within
 * the same update so no artificial delay is ever shown.
 */
export function useTransactionBalanceChangeReconciler() {
  const [state, setState] = useState<TransactionBalanceChangeReconcilerState>({
    status: "idle"
  });

  /**
   * Increments every time a pasted secret key is refused, so the panel can
   * remount the form and wipe it out of the field.
   */
  const [redactions, setRedactions] = useState(0);

  const submit = useCallback((raw: RawReconcilerInput) => {
    setState({ status: "loading" });

    const parsed = parseTransactionBalanceChangeReconcilerInput(raw);
    if (isErr(parsed)) {
      if (parsed.code === "invalid_input") setRedactions((count) => count + 1);
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = reconcileTransactionBalanceChanges(parsed.value);
    setState(
      result.ok
        ? { status: "success", result: result.value }
        : { status: "error", code: result.code }
    );
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset, redactions };
}
