"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAssetStatistics } from "@/features/asset-statistics/hooks/useAssetStatistics";
import { copy, errorCopy } from "@/features/asset-statistics/copy";
import { AssetStatisticsForm } from "@/features/asset-statistics/components/AssetStatisticsForm";
import { AssetStatisticsResult } from "@/features/asset-statistics/components/AssetStatisticsResult";
import { AssetStatisticsEmptyState } from "@/features/asset-statistics/components/AssetStatisticsEmptyState";

export function AssetStatisticsPanel() {
  const { state, submit } = useAssetStatistics();
  const fieldError = state.status === "error" ? state : null;

  return (
    <div className="space-y-5">
      <Card>
        <AssetStatisticsForm
          onSubmit={submit}
          pending={state.status === "loading"}
          errorField={fieldError?.field ?? null}
          errorMessage={fieldError ? errorCopy[fieldError.code].title : null}
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

      {state.status === "error" && !state.field ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <AssetStatisticsResult result={state.result} /> : null}

      {state.status === "idle" ? <AssetStatisticsEmptyState /> : null}
    </div>
  );
}
