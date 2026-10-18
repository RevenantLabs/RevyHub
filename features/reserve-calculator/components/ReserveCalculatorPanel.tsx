"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useReserveCalculator } from "@/features/reserve-calculator/hooks/useReserveCalculator";
import { copy, errorCopy } from "@/features/reserve-calculator/copy";
import { ReserveCalculatorForm } from "@/features/reserve-calculator/components/ReserveCalculatorForm";
import { ReserveCalculatorResult } from "@/features/reserve-calculator/components/ReserveCalculatorResult";
import { ReserveCalculatorEmptyState } from "@/features/reserve-calculator/components/ReserveCalculatorEmptyState";

export function ReserveCalculatorPanel() {
  const { state, submit } = useReserveCalculator();

  return (
    <div className="space-y-5">
      <Card>
        <ReserveCalculatorForm onSubmit={submit} pending={state.status === "loading"} />
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

      {state.status === "success" ? <ReserveCalculatorResult data={state.data} /> : null}

      {state.status === "idle" ? <ReserveCalculatorEmptyState /> : null}
    </div>
  );
}
