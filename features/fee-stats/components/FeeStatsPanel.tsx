"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useFeeStats } from "@/features/fee-stats/hooks/useFeeStats";
import { copy, errorCopy } from "@/features/fee-stats/copy";
import { FeeStatsForm } from "@/features/fee-stats/components/FeeStatsForm";
import { FeeStatsResult } from "@/features/fee-stats/components/FeeStatsResult";
import { FeeStatsEmptyState } from "@/features/fee-stats/components/FeeStatsEmptyState";

export function FeeStatsPanel() {
  const { state, load } = useFeeStats();

  return (
    <div className="space-y-5">
      <Card>
        <FeeStatsForm
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

      {state.status === "success" ? <FeeStatsResult summary={state.summary} /> : null}

      {state.status === "idle" ? <FeeStatsEmptyState /> : null}
    </div>
  );
}
