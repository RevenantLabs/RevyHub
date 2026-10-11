"use client";

import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { Button } from "@/core/ui/Button";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/asset-descriptor-codec/copy";
import { formatAssetType, formatJson, formatMode } from "@/features/asset-descriptor-codec/lib/format";
import type { AssetDescriptorCodecResult as CodecResult } from "@/features/asset-descriptor-codec/types";

/** Props for the AssetDescriptorCodecResult component. */
export interface AssetDescriptorCodecResultProps {
  result: CodecResult;
  onReset: () => void;
}

/**
 * Renders the decoded or encoded asset identity with individual copy controls and reset action.
 */
export function AssetDescriptorCodecResult({
  result,
  onReset
}: AssetDescriptorCodecResultProps) {
  const jsonString = formatJson(result.json);

  return (
    <div className="space-y-4">
      <StatusMessage
        type="success"
        title={copy.resultTitle}
        description={`${formatMode(result.mode)}: ${result.canonicalDescriptor}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultSummary}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.labelCanonical,
              value: (
                <CopyableValue
                  label="canonical descriptor"
                  value={result.canonicalDescriptor}
                  full
                />
              )
            },
            {
              label: copy.labelCode,
              value: <CopyableValue label="asset code" value={result.code} full />
            },
            {
              label: copy.labelIssuer,
              value: result.issuer ? (
                <CopyableValue label="asset issuer" value={result.issuer} full />
              ) : (
                <span className="text-[#637282]">{copy.noIssuerNative}</span>
              )
            },
            {
              label: copy.labelType,
              value: (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatAssetType(result.type)}</span>
                  <CopyableValue label="asset type" value={result.type} full />
                </div>
              )
            },
            {
              label: copy.labelXdr,
              value: <CopyableValue label="asset xdr" value={result.xdr} full />
            }
          ]}
        />
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>{copy.labelJson}</CardTitle>
          <CopyableValue label="structured json" value={jsonString} full />
        </CardHeader>
        <pre className="overflow-x-auto rounded-md bg-[#172033] p-4 text-xs font-mono text-[#e3ebf5]">
          {jsonString}
        </pre>
      </Card>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={onReset}>
          {copy.resetButton}
        </Button>
      </div>
    </div>
  );
}
