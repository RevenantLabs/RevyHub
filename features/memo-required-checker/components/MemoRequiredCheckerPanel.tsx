"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useMemoRequiredChecker } from "@/features/memo-required-checker/hooks/useMemoRequiredChecker";
import { copy, errorCopy } from "@/features/memo-required-checker/copy";
import { MemoRequiredCheckerForm } from "@/features/memo-required-checker/components/MemoRequiredCheckerForm";
import { MemoRequiredCheckerResult } from "@/features/memo-required-checker/components/MemoRequiredCheckerResult";
import { MemoRequiredCheckerEmptyState } from "@/features/memo-required-checker/components/MemoRequiredCheckerEmptyState";

export function MemoRequiredCheckerPanel() {
  const { state, submit } = useMemoRequiredChecker();
  const errorCode = state.status === "error" ? state.code : null;
  const errorField = state.status === "error" ? state.field : null;

  return (
    <div className="space-y-5">
      <Card>
        <MemoRequiredCheckerForm
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

      {state.status === "success" ? <MemoRequiredCheckerResult result={state.result} /> : null}
      {state.status === "idle" ? <MemoRequiredCheckerEmptyState /> : null}
    </div>
  );
}
