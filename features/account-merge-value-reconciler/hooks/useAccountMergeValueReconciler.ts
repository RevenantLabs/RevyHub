"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { containsSecretSeed, parseAccountMergeValueReconcilerInput } from "../schema";
import { runAccountMergeValueReconciler } from "../lib/accountMergeValueReconciler";
import type { AccountMergeValueReconcilerErrorCode as Code, AccountMergeValueReconcilerInput as Input, AccountMergeValueReconcilerResult as Reconciliation } from "../types";

export type AccountMergeValueReconcilerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: Reconciliation }
  | { status: "error"; code: Code };

export function useAccountMergeValueReconciler() {
  const [state, setState] = useState<AccountMergeValueReconcilerState>({ status: "idle" });
  const generation = useRef(0);
  const [redactions, setRedactions] = useState(0);
  const submit = useCallback((raw: Input) => {
    const current = ++generation.current;
    const parsed = parseAccountMergeValueReconcilerInput(raw);
    if (!parsed.ok) {
      // Remount the form so a pasted secret seed does not stay on screen.
      if (parsed.code === "invalid_input" && Object.values(raw).some(containsSecretSeed)) setRedactions((value) => value + 1);
      setState({ status: "error", code: parsed.code });
      return;
    }
    setState({ status: "loading" });
    // Yield once so local processing has an observable, announced loading state.
    Promise.resolve().then(() => {
      if (current !== generation.current) return;
      const result = runAccountMergeValueReconciler(parsed.value);
      if (current !== generation.current) return;
      setState(result.ok ? { status: "success", result: result.value } : { status: "error", code: result.code });
    });
  }, []);
  const reset = useCallback(() => { generation.current++; setState({ status: "idle" }); }, []);
  useEffect(() => () => { generation.current++; }, []);
  return { state, submit, reset, redactions };
}
