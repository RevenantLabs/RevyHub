"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useSequenceInspector } from "@/features/sequence-inspector/hooks/useSequenceInspector";
import { copy, errorCopy } from "@/features/sequence-inspector/copy";
import { SequenceInspectorForm } from "@/features/sequence-inspector/components/SequenceInspectorForm";
import { SequenceInspectorResult } from "@/features/sequence-inspector/components/SequenceInspectorResult";
import { SequenceInspectorEmptyState } from "@/features/sequence-inspector/components/SequenceInspectorEmptyState";

export function SequenceInspectorPanel() {
  const { state, submit, reset } = useSequenceInspector();

  return (
    <div className="space-y-5">
      <Card>
        <SequenceInspectorForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">{copy.loading}</p>
          <SkeletonRows rows={6} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <SequenceInspectorResult result={state.result} onReset={reset} />
      ) : null}

      {state.status === "idle" ? <SequenceInspectorEmptyState /> : null}
    </div>
  );
}
