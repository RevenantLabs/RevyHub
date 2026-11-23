"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { TransactionBalanceChangeReconcilerEmptyState } from "@/features/transaction-balance-change-reconciler/components/TransactionBalanceChangeReconcilerEmptyState";
import { TransactionBalanceChangeReconcilerForm } from "@/features/transaction-balance-change-reconciler/components/TransactionBalanceChangeReconcilerForm";
import { TransactionBalanceChangeReconcilerResult } from "@/features/transaction-balance-change-reconciler/components/TransactionBalanceChangeReconcilerResult";
import { copy, errorCopy } from "@/features/transaction-balance-change-reconciler/copy";
import { useTransactionBalanceChangeReconciler } from "@/features/transaction-balance-change-reconciler/hooks/useTransactionBalanceChangeReconciler";

export function TransactionBalanceChangeReconcilerPanel() {
  const { state, submit, redactions } = useTransactionBalanceChangeReconciler();

  return (
    <div className="space-y-5">
      <Card>
        {/*
          Keying on the redaction counter remounts the form when a secret key
          is refused, which is what actually clears it out of the field.
        */}
        <TransactionBalanceChangeReconcilerForm key={redactions} onSubmit={submit} />
      </Card>

      {state.status === "loading" ? (
        <Card aria-label={copy.loadingLabel}>
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
        <TransactionBalanceChangeReconcilerResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <TransactionBalanceChangeReconcilerEmptyState /> : null}
    </div>
  );
}
