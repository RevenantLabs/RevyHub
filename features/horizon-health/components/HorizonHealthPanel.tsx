"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useHorizonHealth } from "@/features/horizon-health/hooks/useHorizonHealth";
import { copy, errorCopy } from "@/features/horizon-health/copy";
import { HorizonHealthForm } from "@/features/horizon-health/components/HorizonHealthForm";
import { HorizonHealthResult } from "@/features/horizon-health/components/HorizonHealthResult";
import { HorizonHealthEmptyState } from "@/features/horizon-health/components/HorizonHealthEmptyState";

/** Composes the idle, loading, error, and result states for Horizon health diagnostic. */
export function HorizonHealthPanel() {
  const { state, load } = useHorizonHealth();

  return (
    <div className="space-y-5">
      <Card>
        <HorizonHealthForm
          onLoad={load}
          pending={state.status === "loading"}
          loaded={state.status === "success"}
        />
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

      {state.status === "success" ? (
        <HorizonHealthResult summary={state.summary} />
      ) : null}

      {state.status === "idle" ? <HorizonHealthEmptyState /> : null}
    </div>
  );
}
