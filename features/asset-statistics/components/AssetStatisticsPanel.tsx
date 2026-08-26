"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAssetStatistics } from "@/features/asset-statistics/hooks/useAssetStatistics";
import { errorCopy } from "@/features/asset-statistics/copy";
import { AssetStatisticsForm } from "@/features/asset-statistics/components/AssetStatisticsForm";
import { AssetStatisticsResult } from "@/features/asset-statistics/components/AssetStatisticsResult";
import { AssetStatisticsEmptyState } from "@/features/asset-statistics/components/AssetStatisticsEmptyState";

export function AssetStatisticsPanel() {
  const { state, submit } = useAssetStatistics();

  return (
    <div className="space-y-5">
      <Card>
        <AssetStatisticsForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
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
