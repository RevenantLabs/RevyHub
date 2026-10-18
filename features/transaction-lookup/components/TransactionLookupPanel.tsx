"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useTransactionLookup } from "@/features/transaction-lookup/hooks/useTransactionLookup";
import { copy, errorCopy } from "@/features/transaction-lookup/copy";
import { TransactionLookupForm } from "@/features/transaction-lookup/components/TransactionLookupForm";
import { TransactionLookupResult } from "@/features/transaction-lookup/components/TransactionLookupResult";
import { TransactionLookupEmptyState } from "@/features/transaction-lookup/components/TransactionLookupEmptyState";

export function TransactionLookupPanel() {
  const { state, submit } = useTransactionLookup();

  return (
    <div className="space-y-5">
      <Card>
        <TransactionLookupForm onSubmit={submit} pending={state.status === "loading"} />
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
        <TransactionLookupResult transaction={state.transaction} />
      ) : null}

      {state.status === "idle" ? <TransactionLookupEmptyState /> : null}
    </div>
  );
}
