"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useNetworkComparison } from "@/features/network-comparison/hooks/useNetworkComparison";
import { copy, errorCopy } from "@/features/network-comparison/copy";
import { NetworkComparisonForm } from "@/features/network-comparison/components/NetworkComparisonForm";
import { NetworkComparisonEmptyState } from "@/features/network-comparison/components/NetworkComparisonEmptyState";
import { NetworkComparisonResult } from "@/features/network-comparison/components/NetworkComparisonResult";

/**
 * Orchestrator panel for the network comparison feature.
 * Connects useNetworkComparison hook with UI representations of idle, loading, success, and error states.
 *
 * @returns Rendered component hierarchy.
 */
export function NetworkComparisonPanel() {
  const { state, load } = useNetworkComparison();

  return (
    <div className="space-y-5">
      <Card>
        <NetworkComparisonForm
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
          <SkeletonRows rows={5} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <div className="space-y-5">
          <StatusMessage
            type={state.code === "partial_failure" ? "warning" : "error"}
            title={errorCopy[state.code].title}
            description={errorCopy[state.code].description}
          />
          {state.partial ? <NetworkComparisonResult data={state.partial} /> : null}
        </div>
      ) : null}

      {state.status === "success" ? (
        <NetworkComparisonResult data={state.data} />
      ) : null}

      {state.status === "idle" ? <NetworkComparisonEmptyState /> : null}
    </div>
  );
}
