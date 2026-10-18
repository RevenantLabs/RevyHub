"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { errorCopy } from "@/features/transaction-envelope-diff/copy";
import { useTransactionEnvelopeDiff } from "@/features/transaction-envelope-diff/hooks/useTransactionEnvelopeDiff";
import { TransactionEnvelopeDiffForm } from "@/features/transaction-envelope-diff/components/TransactionEnvelopeDiffForm";
import { TransactionEnvelopeDiffResult } from "@/features/transaction-envelope-diff/components/TransactionEnvelopeDiffResult";
import { TransactionEnvelopeDiffEmptyState } from "@/features/transaction-envelope-diff/components/TransactionEnvelopeDiffEmptyState";

export function TransactionEnvelopeDiffPanel() {
  const { state, filter, setFilter, visibleEntries, resetFilter, submit, redactions } =
    useTransactionEnvelopeDiff();

  return (
    <div className="space-y-5">
      <Card>
        {/*
          Keying on the redaction counter remounts the form when a secret key
          is refused, which is what actually clears it out of the field.
        */}
        <TransactionEnvelopeDiffForm key={redactions} onSubmit={submit} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <SkeletonRows rows={4} />
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
        <TransactionEnvelopeDiffResult
          summary={state.summary}
          filter={filter}
          onFilterChange={setFilter}
          onResetFilter={resetFilter}
          visibleEntries={visibleEntries}
        />
      ) : null}

      {state.status === "idle" ? <TransactionEnvelopeDiffEmptyState /> : null}
    </div>
  );
}
