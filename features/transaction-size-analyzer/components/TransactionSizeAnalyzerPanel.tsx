"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { errorCopy } from "@/features/transaction-size-analyzer/copy";
import { useTransactionSizeAnalyzer } from "@/features/transaction-size-analyzer/hooks/useTransactionSizeAnalyzer";
import { TransactionSizeAnalyzerForm } from "@/features/transaction-size-analyzer/components/TransactionSizeAnalyzerForm";
import { TransactionSizeAnalyzerResult } from "@/features/transaction-size-analyzer/components/TransactionSizeAnalyzerResult";
import { TransactionSizeAnalyzerEmptyState } from "@/features/transaction-size-analyzer/components/TransactionSizeAnalyzerEmptyState";

export function TransactionSizeAnalyzerPanel() {
  const { state, submit } = useTransactionSizeAnalyzer();

  return (
    <div className="space-y-5">
      <Card>
        <TransactionSizeAnalyzerForm onSubmit={submit} />
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
        <TransactionSizeAnalyzerResult report={state.report} />
      ) : null}

      {state.status === "idle" ? <TransactionSizeAnalyzerEmptyState /> : null}
    </div>
  );
}
