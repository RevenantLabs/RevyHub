"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useSimulationExplainer } from "@/features/simulation-explainer/hooks/useSimulationExplainer";
import { copy, errorCopy } from "@/features/simulation-explainer/copy";
import { SimulationExplainerForm } from "@/features/simulation-explainer/components/SimulationExplainerForm";
import { SimulationExplainerResult } from "@/features/simulation-explainer/components/SimulationExplainerResult";
import { SimulationExplainerEmptyState } from "@/features/simulation-explainer/components/SimulationExplainerEmptyState";

export function SimulationExplainerPanel() {
  const { state, submit } = useSimulationExplainer();

  return (
    <div className="space-y-5">
      <Card>
        <SimulationExplainerForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
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

      {state.status === "success" ? <SimulationExplainerResult result={state.result} /> : null}

      {state.status === "idle" ? <SimulationExplainerEmptyState /> : null}
    </div>
  );
}
