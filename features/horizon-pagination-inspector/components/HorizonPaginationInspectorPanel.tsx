"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useHorizonPaginationInspector } from "@/features/horizon-pagination-inspector/hooks/useHorizonPaginationInspector";
import { errorCopy } from "@/features/horizon-pagination-inspector/copy";
import { HorizonPaginationInspectorForm } from "@/features/horizon-pagination-inspector/components/HorizonPaginationInspectorForm";
import { HorizonPaginationInspectorResult } from "@/features/horizon-pagination-inspector/components/HorizonPaginationInspectorResult";
import { HorizonPaginationInspectorEmptyState } from "@/features/horizon-pagination-inspector/components/HorizonPaginationInspectorEmptyState";

export function HorizonPaginationInspectorPanel() {
  const { state, submit } = useHorizonPaginationInspector();

  return (
    <div className="space-y-5">
      <Card>
        <HorizonPaginationInspectorForm onSubmit={submit} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <HorizonPaginationInspectorResult inspection={state.inspection} />
      ) : null}

      {state.status === "idle" ? <HorizonPaginationInspectorEmptyState /> : null}
    </div>
  );
}
