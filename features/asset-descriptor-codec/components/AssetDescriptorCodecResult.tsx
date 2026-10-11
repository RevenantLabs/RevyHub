import { useState } from "react";
import { Card } from "@/core/ui/Card";
import { copy } from "@/features/asset-descriptor-codec/copy";
import { formatAssetKindLabel, formatJsonForDisplay } from "@/features/asset-descriptor-codec/lib/format";
import type { AssetDescriptorResult, DecodeXdrResult } from "@/features/asset-descriptor-codec/types";

interface Props {
  result: AssetDescriptorResult | DecodeXdrResult;
}

export function AssetDescriptorCodecResult({ result }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-[#172033]">{copy.resultTitle}</h3>

          <div className="grid gap-3">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-[#68758a]">
                {copy.kindLabel}
              </span>
              <p className="mt-0.5 text-sm text-[#172033]">{formatAssetKindLabel(result.descriptor)}</p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-[#68758a]">
                {copy.canonicalLabel}
              </span>
              <p className="mt-0.5 break-all text-sm font-mono text-[#172033]">{result.canonical}</p>
            </div>

            {result.descriptor.kind !== "native" && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-[#68758a]">
                  {copy.issuerLabel}
                </span>
                <p className="mt-0.5 break-all text-sm font-mono text-[#172033]">
                  {result.descriptor.issuer}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-[#68758a]">
              {copy.jsonLabel}
            </span>
            <button
              onClick={() => handleCopy(JSON.stringify(result.json, null, 2), "json")}
              className="text-xs text-[#6366f1] hover:underline"
            >
              {copiedField === "json" ? copy.copied : copy.copyJsonButton}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-md bg-[#f3f4f6] p-3 text-xs text-[#172033]">
            {formatJsonForDisplay(result.json)}
          </pre>
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-[#68758a]">
              {copy.xdrLabel}
            </span>
            <button
              onClick={() => handleCopy(result.xdr, "xdr")}
              className="text-xs text-[#6366f1] hover:underline"
            >
              {copiedField === "xdr" ? copy.copied : copy.copyXdrButton}
            </button>
          </div>
          <pre className="overflow-x-auto break-all rounded-md bg-[#f3f4f6] p-3 text-xs text-[#172033]">
            {result.xdr}
          </pre>
        </div>
      </Card>
    </div>
  );
}
