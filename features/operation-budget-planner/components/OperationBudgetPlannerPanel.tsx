"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useOperationBudgetPlanner } from "@/features/operation-budget-planner/hooks/useOperationBudgetPlanner";
import { errorCopy } from "@/features/operation-budget-planner/copy";
import { OperationBudgetPlannerForm } from "@/features/operation-budget-planner/components/OperationBudgetPlannerForm";
import { OperationBudgetPlannerResult } from "@/features/operation-budget-planner/components/OperationBudgetPlannerResult";
import { OperationBudgetPlannerEmptyState } from "@/features/operation-budget-planner/components/OperationBudgetPlannerEmptyState";

export function OperationBudgetPlannerPanel() {
  const { state, submit } = useOperationBudgetPlanner();

  return (
    <div className="space-y-5">
      <Card>
        <OperationBudgetPlannerForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <OperationBudgetPlannerResult result={state.result} /> : null}

      {state.status === "idle" ? <OperationBudgetPlannerEmptyState /> : null}
    </div>
  );
}
