"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAssetDescriptorCodec } from "@/features/asset-descriptor-codec/hooks/useAssetDescriptorCodec";
import { copy, errorCopy } from "@/features/asset-descriptor-codec/copy";
import { AssetDescriptorCodecForm } from "@/features/asset-descriptor-codec/components/AssetDescriptorCodecForm";
import { AssetDescriptorCodecResult } from "@/features/asset-descriptor-codec/components/AssetDescriptorCodecResult";
import { AssetDescriptorCodecEmptyState } from "@/features/asset-descriptor-codec/components/AssetDescriptorCodecEmptyState";

export function AssetDescriptorCodecPanel() {
  const { state, convert } = useAssetDescriptorCodec();

  return (
    <div className="space-y-5">
      <Card>
        <AssetDescriptorCodecForm onSubmit={convert} loading={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <AssetDescriptorCodecResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <AssetDescriptorCodecEmptyState /> : null}
    </div>
  );
}
