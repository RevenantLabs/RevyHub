"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { usePreconditionsExplainer } from "@/features/preconditions-explainer/hooks/usePreconditionsExplainer";
import { copy, errorCopy } from "@/features/preconditions-explainer/copy";
import { PreconditionsExplainerForm } from "@/features/preconditions-explainer/components/PreconditionsExplainerForm";
import { PreconditionsExplainerResult } from "@/features/preconditions-explainer/components/PreconditionsExplainerResult";
import { PreconditionsExplainerEmptyState } from "@/features/preconditions-explainer/components/PreconditionsExplainerEmptyState";

export function PreconditionsExplainerPanel() {
  const { state, submit, reset } = usePreconditionsExplainer();

  return (
    <div className="space-y-5">
      <Card>
        <PreconditionsExplainerForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={5} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          // A transaction that declares nothing is an answer, not a failure:
          // "valid indefinitely" is the finding, so it is announced politely
          // rather than as an error the reader has to fix.
          type={state.code === "no_preconditions" ? "info" : "error"}
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <PreconditionsExplainerResult explanation={state.explanation} onReset={reset} />
      ) : null}

      {state.status === "idle" ? <PreconditionsExplainerEmptyState /> : null}
    </div>
  );
}
