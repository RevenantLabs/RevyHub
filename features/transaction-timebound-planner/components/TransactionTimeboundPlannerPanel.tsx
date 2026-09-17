"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useTransactionTimeboundPlanner } from "@/features/transaction-timebound-planner/hooks/useTransactionTimeboundPlanner";
import { errorCopy } from "@/features/transaction-timebound-planner/copy";
import { TransactionTimeboundPlannerForm } from "@/features/transaction-timebound-planner/components/TransactionTimeboundPlannerForm";
import { TransactionTimeboundPlannerResult } from "@/features/transaction-timebound-planner/components/TransactionTimeboundPlannerResult";
import { TransactionTimeboundPlannerEmptyState } from "@/features/transaction-timebound-planner/components/TransactionTimeboundPlannerEmptyState";

export function TransactionTimeboundPlannerPanel() {
  const { state, submit } = useTransactionTimeboundPlanner();

  return (
    <div className="space-y-5">
      <Card>
        <TransactionTimeboundPlannerForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <TransactionTimeboundPlannerResult result={state.result} /> : null}

      {state.status === "idle" ? <TransactionTimeboundPlannerEmptyState /> : null}
    </div>
  );
}
