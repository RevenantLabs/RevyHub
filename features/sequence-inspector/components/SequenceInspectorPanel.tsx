"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { SequenceInspectorEmptyState } from "@/features/sequence-inspector/components/SequenceInspectorEmptyState";
import { SequenceInspectorForm } from "@/features/sequence-inspector/components/SequenceInspectorForm";
import { SequenceInspectorResult } from "@/features/sequence-inspector/components/SequenceInspectorResult";
import { copy, errorCopy } from "@/features/sequence-inspector/copy";
import { useSequenceInspector } from "@/features/sequence-inspector/hooks/useSequenceInspector";

export function SequenceInspectorPanel() {
  const { state, submit } = useSequenceInspector();

  return (
    <div className="space-y-5">
      <Card>
        <SequenceInspectorForm onSubmit={submit} isLoading={state.status === "loading"} />
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
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <SequenceInspectorResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <SequenceInspectorEmptyState /> : null}
    </div>
  );
}
