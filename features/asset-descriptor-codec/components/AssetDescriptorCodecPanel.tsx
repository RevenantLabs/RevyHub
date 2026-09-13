"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAssetDescriptorCodec } from "@/features/asset-descriptor-codec/hooks/useAssetDescriptorCodec";
import { errorCopy } from "@/features/asset-descriptor-codec/copy";
import { AssetDescriptorCodecForm } from "@/features/asset-descriptor-codec/components/AssetDescriptorCodecForm";
import { AssetDescriptorCodecResult } from "@/features/asset-descriptor-codec/components/AssetDescriptorCodecResult";
import { AssetDescriptorCodecEmptyState } from "@/features/asset-descriptor-codec/components/AssetDescriptorCodecEmptyState";

/**
 * Top-level panel component composing the form, empty, loading, success, and error states.
 */
export function AssetDescriptorCodecPanel() {
  const { state, submit, reset } = useAssetDescriptorCodec();

  return (
    <div className="space-y-5">
      <Card>
        <AssetDescriptorCodecForm
          onSubmit={submit}
          pending={state.status === "loading"}
        />
      </Card>

      {state.status === "loading" ? (
        <StatusMessage
          type="info"
          title="Processing asset..."
          description="Converting asset representation offline."
        />
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <AssetDescriptorCodecResult result={state.result} onReset={reset} />
      ) : null}

      {state.status === "idle" ? <AssetDescriptorCodecEmptyState /> : null}
    </div>
  );
}
