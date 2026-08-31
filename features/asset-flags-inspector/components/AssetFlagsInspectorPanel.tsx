"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAssetFlagsInspector } from "@/features/asset-flags-inspector/hooks/useAssetFlagsInspector";
import { copy, errorCopy } from "@/features/asset-flags-inspector/copy";
import { AssetFlagsInspectorForm } from "@/features/asset-flags-inspector/components/AssetFlagsInspectorForm";
import { AssetFlagsInspectorResult } from "@/features/asset-flags-inspector/components/AssetFlagsInspectorResult";
import { AssetFlagsInspectorEmptyState } from "@/features/asset-flags-inspector/components/AssetFlagsInspectorEmptyState";

export function AssetFlagsInspectorPanel() {
  const { state, submit } = useAssetFlagsInspector();

  return (
    <div className="space-y-5">
      <Card>
        <AssetFlagsInspectorForm onSubmit={submit} pending={state.status === "loading"} />
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

      {state.status === "success" ? <AssetFlagsInspectorResult result={state.result} /> : null}

      {state.status === "idle" ? <AssetFlagsInspectorEmptyState /> : null}
    </div>
  );
}
