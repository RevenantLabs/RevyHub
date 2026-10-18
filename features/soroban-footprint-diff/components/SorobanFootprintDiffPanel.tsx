"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { SorobanFootprintDiffEmptyState } from "@/features/soroban-footprint-diff/components/SorobanFootprintDiffEmptyState";
import { SorobanFootprintDiffForm } from "@/features/soroban-footprint-diff/components/SorobanFootprintDiffForm";
import { SorobanFootprintDiffResultView } from "@/features/soroban-footprint-diff/components/SorobanFootprintDiffResult";
import { copy, errorCopy } from "@/features/soroban-footprint-diff/copy";
import { useSorobanFootprintDiff } from "@/features/soroban-footprint-diff/hooks/useSorobanFootprintDiff";

export function SorobanFootprintDiffPanel() {
  const { state, submit } = useSorobanFootprintDiff();

  return (
    <div className="space-y-5">
      <Card>
        <SorobanFootprintDiffForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={3} />
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
        <SorobanFootprintDiffResultView result={state.result} />
      ) : null}

      {state.status === "idle" ? <SorobanFootprintDiffEmptyState /> : null}
    </div>
  );
}
