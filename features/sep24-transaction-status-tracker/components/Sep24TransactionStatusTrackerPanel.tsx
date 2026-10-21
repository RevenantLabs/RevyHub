"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useSep24TransactionStatusTracker } from "@/features/sep24-transaction-status-tracker/hooks/useSep24TransactionStatusTracker";
import { copy, errorCopy } from "@/features/sep24-transaction-status-tracker/copy";
import { Sep24TransactionStatusTrackerForm } from "@/features/sep24-transaction-status-tracker/components/Sep24TransactionStatusTrackerForm";
import { Sep24TransactionStatusTrackerResult } from "@/features/sep24-transaction-status-tracker/components/Sep24TransactionStatusTrackerResult";
import { Sep24TransactionStatusTrackerEmptyState } from "@/features/sep24-transaction-status-tracker/components/Sep24TransactionStatusTrackerEmptyState";

export function Sep24TransactionStatusTrackerPanel() {
  const { state, submit } = useSep24TransactionStatusTracker();
  const errorCode = state.status === "error" ? state.code : null;
  const errorField = state.status === "error" ? state.field : null;

  return (
    <div className="space-y-5">
      <Card>
        <Sep24TransactionStatusTrackerForm
          onSubmit={submit}
          pending={state.status === "loading"}
          errorField={errorField}
          errorCode={errorCode}
        />
      </Card>
      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={3} />
        </Card>
      ) : null}
      {state.status === "error" && !errorField ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}
      {state.status === "success" ? <Sep24TransactionStatusTrackerResult result={state.result} /> : null}
      {state.status === "idle" ? <Sep24TransactionStatusTrackerEmptyState /> : null}
    </div>
  );
}
