"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useTransactionSequenceGapAuditor } from "@/features/transaction-sequence-gap-auditor/hooks/useTransactionSequenceGapAuditor";
import { copy, errorCopy } from "@/features/transaction-sequence-gap-auditor/copy";
import { TransactionSequenceGapAuditorForm } from "@/features/transaction-sequence-gap-auditor/components/TransactionSequenceGapAuditorForm";
import { TransactionSequenceGapAuditorResult } from "@/features/transaction-sequence-gap-auditor/components/TransactionSequenceGapAuditorResult";
import { TransactionSequenceGapAuditorEmptyState } from "@/features/transaction-sequence-gap-auditor/components/TransactionSequenceGapAuditorEmptyState";

export function TransactionSequenceGapAuditorPanel() {
  const { state, submit } = useTransactionSequenceGapAuditor();

  return (
    <div className="space-y-5">
      <Card>
        <TransactionSequenceGapAuditorForm onSubmit={submit} pending={state.status === "loading"} />
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

      {state.status === "success" ? <TransactionSequenceGapAuditorResult result={state.result} /> : null}

      {state.status === "idle" ? <TransactionSequenceGapAuditorEmptyState /> : null}
    </div>
  );
}
