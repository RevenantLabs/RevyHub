"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAssetMetadata } from "@/features/asset-metadata/hooks/useAssetMetadata";
import { copy, errorCopy } from "@/features/asset-metadata/copy";
import { AssetMetadataForm } from "@/features/asset-metadata/components/AssetMetadataForm";
import { AssetMetadataResult } from "@/features/asset-metadata/components/AssetMetadataResult";
import { AssetMetadataEmptyState } from "@/features/asset-metadata/components/AssetMetadataEmptyState";

export function AssetMetadataPanel() {
  const { state, submit } = useAssetMetadata();

  return (
    <div className="space-y-5">
      <Card>
        <AssetMetadataForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={3} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <AssetMetadataResult result={state.result} /> : null}

      {state.status === "idle" ? <AssetMetadataEmptyState /> : null}
    </div>
  );
}
