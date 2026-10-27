"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useBatchOperationSummary } from "@/features/batch-operation-summary/hooks/useBatchOperationSummary";
import { errorCopy } from "@/features/batch-operation-summary/copy";
import { BatchOperationSummaryForm } from "@/features/batch-operation-summary/components/BatchOperationSummaryForm";
import { BatchOperationSummaryResult } from "@/features/batch-operation-summary/components/BatchOperationSummaryResult";
import { BatchOperationSummaryEmptyState } from "@/features/batch-operation-summary/components/BatchOperationSummaryEmptyState";

export function BatchOperationSummaryPanel() {
  const { state, submit } = useBatchOperationSummary();

  return (
    <div className="space-y-5">
      <Card>
        <BatchOperationSummaryForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <BatchOperationSummaryResult result={state.result} /> : null}

      {state.status === "idle" ? <BatchOperationSummaryEmptyState /> : null}
    </div>
  );
}
