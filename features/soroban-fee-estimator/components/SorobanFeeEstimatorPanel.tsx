"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useSorobanFeeEstimator } from "@/features/soroban-fee-estimator/hooks/useSorobanFeeEstimator";
import { errorCopy } from "@/features/soroban-fee-estimator/copy";
import { SorobanFeeEstimatorForm } from "@/features/soroban-fee-estimator/components/SorobanFeeEstimatorForm";
import { SorobanFeeEstimatorResult } from "@/features/soroban-fee-estimator/components/SorobanFeeEstimatorResult";
import { SorobanFeeEstimatorEmptyState } from "@/features/soroban-fee-estimator/components/SorobanFeeEstimatorEmptyState";

export function SorobanFeeEstimatorPanel() {
  const { state, submit } = useSorobanFeeEstimator();

  return (
    <div className="space-y-5">
      <Card>
        <SorobanFeeEstimatorForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <SorobanFeeEstimatorResult result={state.result} /> : null}

      {state.status === "idle" ? <SorobanFeeEstimatorEmptyState /> : null}
    </div>
  );
}
