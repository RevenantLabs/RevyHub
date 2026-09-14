"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useSorobanAuthInspector } from "@/features/soroban-auth-inspector/hooks/useSorobanAuthInspector";
import { copy, errorCopy } from "@/features/soroban-auth-inspector/copy";
import { SorobanAuthInspectorForm } from "@/features/soroban-auth-inspector/components/SorobanAuthInspectorForm";
import { SorobanAuthInspectorResult } from "@/features/soroban-auth-inspector/components/SorobanAuthInspectorResult";
import { SorobanAuthInspectorEmptyState } from "@/features/soroban-auth-inspector/components/SorobanAuthInspectorEmptyState";

export function SorobanAuthInspectorPanel() {
  const { state, submit, reset } = useSorobanAuthInspector();

  return (
    <div className="space-y-5">
      <Card>
        <SorobanAuthInspectorForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type={state.code === "no_authorization" ? "info" : "error"}
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <SorobanAuthInspectorResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <SorobanAuthInspectorEmptyState /> : null}

      {state.status !== "idle" ? (
        <button
          type="button"
          onClick={reset}
          className="text-sm font-semibold text-[#47a8c7] hover:underline"
        >
          Inspect another envelope
        </button>
      ) : null}
    </div>
  );
}
