"use client";

import { Card } from "@/core/ui/Card";
import { Button } from "@/core/ui/Button";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy } from "../copy";
import { useAccountMergeValueReconciler } from "../hooks/useAccountMergeValueReconciler";
import { AccountMergeValueReconcilerForm } from "./AccountMergeValueReconcilerForm";
import { AccountMergeValueReconcilerResult } from "./AccountMergeValueReconcilerResult";
import { AccountMergeValueReconcilerEmptyState } from "./AccountMergeValueReconcilerEmptyState";

export function AccountMergeValueReconcilerPanel() {
  const { state, submit, reset, redactions } = useAccountMergeValueReconciler();
  return <div className="space-y-5">
    <Card><AccountMergeValueReconcilerForm key={redactions} onSubmit={submit} pending={state.status === "loading"} />
      {state.status !== "idle" && <div className="mt-4"><Button type="button" variant="secondary" onClick={reset}>{copy.reset}</Button></div>}
    </Card>
    {state.status === "loading" && <StatusMessage type="info" title={copy.loading} />}
    {state.status === "error" && <StatusMessage type="error" title={errorCopy[state.code].title} description={errorCopy[state.code].description} />}
    {state.status === "success" && <AccountMergeValueReconcilerResult result={state.result} />}
    {state.status === "idle" && <AccountMergeValueReconcilerEmptyState />}
  </div>;
}
