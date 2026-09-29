"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy } from "@/features/predicate-builder/copy";
import { PredicateBuilderEmptyState } from "@/features/predicate-builder/components/PredicateBuilderEmptyState";
import { PredicateBuilderForm } from "@/features/predicate-builder/components/PredicateBuilderForm";
import { PredicateBuilderResult } from "@/features/predicate-builder/components/PredicateBuilderResult";
import { usePredicateBuilder } from "@/features/predicate-builder/hooks/usePredicateBuilder";

export function PredicateBuilderPanel() {
  const { state, submit } = usePredicateBuilder();
  const error = state.status === "error" ? state : null;

  return (
    <div className="space-y-5">
      <Card>
        <PredicateBuilderForm
          onSubmit={submit}
          pending={state.status === "encoding"}
        />
      </Card>

      {/* Banner errors only when not field-specific */}
      {error && !error.field ? (
        <StatusMessage
          type="error"
          title={errorCopy[error.code].title}
          description={errorCopy[error.code].description}
        />
      ) : null}

      {state.status === "encoding" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.encodingStatus}
          </p>
          <SkeletonRows rows={3} />
        </Card>
      ) : null}

      {state.status === "success" ? (
        <PredicateBuilderResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <PredicateBuilderEmptyState /> : null}
    </div>
  );
}
