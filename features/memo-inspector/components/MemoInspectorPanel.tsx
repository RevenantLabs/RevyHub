"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy } from "@/features/memo-inspector/copy";
import { MemoInspectorEmptyState } from "@/features/memo-inspector/components/MemoInspectorEmptyState";
import { MemoInspectorForm } from "@/features/memo-inspector/components/MemoInspectorForm";
import { MemoInspectorResult } from "@/features/memo-inspector/components/MemoInspectorResult";
import { useMemoInspector } from "@/features/memo-inspector/hooks/useMemoInspector";

export function MemoInspectorPanel() {
  const { state, submit } = useMemoInspector();
  const error = state.status === "error" ? state : null;

  return (
    <div className="space-y-5">
      <Card>
        <MemoInspectorForm
          onSubmit={submit}
          pending={state.status === "encoding"}
          errorField={error?.field ?? null}
          errorMessage={error ? errorCopy[error.code].title : null}
        />
      </Card>

      {/* A field-level error already announces itself, so it is never doubled. */}
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
        <MemoInspectorResult
          input={state.input}
          encoding={state.encoding}
          decoded={state.decoded}
        />
      ) : null}

      {state.status === "idle" ? <MemoInspectorEmptyState /> : null}
    </div>
  );
}
