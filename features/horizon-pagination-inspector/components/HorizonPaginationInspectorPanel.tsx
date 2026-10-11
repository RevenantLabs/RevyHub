"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { HorizonPaginationInspectorEmptyState } from "@/features/horizon-pagination-inspector/components/HorizonPaginationInspectorEmptyState";
import { HorizonPaginationInspectorForm } from "@/features/horizon-pagination-inspector/components/HorizonPaginationInspectorForm";
import { HorizonPaginationInspectorResult } from "@/features/horizon-pagination-inspector/components/HorizonPaginationInspectorResult";
import { errorCopy } from "@/features/horizon-pagination-inspector/copy";
import { useHorizonPaginationInspector } from "@/features/horizon-pagination-inspector/hooks/useHorizonPaginationInspector";

/** Primary container panel coordinating form input, loading, and diagnostic results. */
export function HorizonPaginationInspectorPanel() {
  const { state, submit, reset, redactions } = useHorizonPaginationInspector();

  return (
    <div className="space-y-5">
      <Card>
        <HorizonPaginationInspectorForm
          key={redactions}
          onSubmit={submit}
          onReset={reset}
        />
      </Card>

      {state.status === "loading" && (
        <Card>
          <SkeletonRows rows={4} />
        </Card>
      )}

      {state.status === "error" && (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      )}

      {state.status === "success" && (
        <HorizonPaginationInspectorResult report={state.report} />
      )}

      {state.status === "idle" && <HorizonPaginationInspectorEmptyState />}
    </div>
  );
}
