"use client";

import { useState } from "react";
import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { ReserveCapacityPlannerEmptyState } from "@/features/reserve-capacity-planner/components/ReserveCapacityPlannerEmptyState";
import { ReserveCapacityPlannerForm } from "@/features/reserve-capacity-planner/components/ReserveCapacityPlannerForm";
import { ReserveCapacityPlannerResult } from "@/features/reserve-capacity-planner/components/ReserveCapacityPlannerResult";
import { copy, errorCopy, fieldErrorMessage } from "@/features/reserve-capacity-planner/copy";
import { useReserveCapacityPlanner } from "@/features/reserve-capacity-planner/hooks/useReserveCapacityPlanner";

export function ReserveCapacityPlannerPanel() {
  const { state, submit, reset, rejectSecret } = useReserveCapacityPlanner();
  const [formGeneration, setFormGeneration] = useState(0);

  const errorField = state.status === "error" ? (state.field ?? null) : null;
  const errorMessage = state.status === "error" ? fieldErrorMessage(state.code, state.field) : null;
  const banner = state.status === "error" && errorMessage === null ? errorCopy[state.code] : null;

  function handleReset() {
    reset();
    setFormGeneration((current) => current + 1);
  }

  return (
    <div className="space-y-5">
      <Card>
        <ReserveCapacityPlannerForm
          key={formGeneration}
          onSubmit={submit}
          onEdit={reset}
          onSecretRejected={rejectSecret}
          onReset={handleReset}
          pending={state.status === "loading"}
          errorField={errorField}
          errorMessage={errorMessage}
        />
      </Card>

      {state.status === "loading" ? (
        <p role="status" className="text-sm font-semibold text-[#172033]">
          {copy.loading}
        </p>
      ) : null}

      {banner ? <StatusMessage type="error" title={banner.title} description={banner.description} /> : null}

      {state.status === "success" ? <ReserveCapacityPlannerResult result={state.result} /> : null}

      {state.status === "idle" ? <ReserveCapacityPlannerEmptyState /> : null}
    </div>
  );
}
