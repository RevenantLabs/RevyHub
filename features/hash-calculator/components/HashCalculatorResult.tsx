"use client";

import { Badge } from "@/core/ui/Badge";
import { Button } from "@/core/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/hash-calculator/copy";
import { formatBytes, formatEncoding, formatPassphrasePreset } from "@/features/hash-calculator/lib/format";
import type { HashCalculatorResult as ResultType, NetworkPassphrasePreset } from "@/features/hash-calculator/types";

/** Renders computed hash results for raw data or transaction envelopes. */
export function HashCalculatorResult({
  result,
  onSwitchPassphrase
}: {
  result: ResultType;
  onSwitchPassphrase?: (preset: NetworkPassphrasePreset) => void;
}) {
  if (result.mode === "data") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{copy.resultDataTitle}</CardTitle>
          <CardDescription>{copy.resultTitle}</CardDescription>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.inputEncodingLabel,
              value: formatEncoding(result.encoding)
            },
            {
              label: copy.inputSizeLabel,
              value: formatBytes(result.inputByteLength)
            },
            {
              label: copy.hexLabel,
              value: (
                <CopyableValue
                  label={copy.copyHexLabel}
                  value={result.hashHex}
                  full
                  className="break-all font-mono"
                />
              )
            },
            {
              label: copy.base64Label,
              value: (
                <CopyableValue
                  label={copy.copyBase64Label}
                  value={result.hashBase64}
                  full
                  className="break-all font-mono"
                />
              )
            }
          ]}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>{copy.resultTxTitle}</CardTitle>
            <Badge tone="info">{formatPassphrasePreset(result.selectedPreset)}</Badge>
          </div>
          <CardDescription>{copy.resultTitle}</CardDescription>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.networkLabel,
              value: result.selectedPassphrase,
              mono: true
            },
            {
              label: copy.hexLabel,
              value: (
                <CopyableValue
                  label={copy.copyHexLabel}
                  value={result.hashHex}
                  full
                  className="break-all font-mono"
                />
              )
            },
            {
              label: copy.base64Label,
              value: (
                <CopyableValue
                  label={copy.copyBase64Label}
                  value={result.hashBase64}
                  full
                  className="break-all font-mono"
                />
              )
            },
            {
              label: copy.envelopeTypeLabel,
              value: result.envelopeType
            },
            {
              label: copy.operationsLabel,
              value: String(result.operationCount)
            }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.comparisonTitle}</CardTitle>
          <CardDescription>{copy.comparisonDescription}</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <div className="rounded-md border border-[#c7d6e8] bg-white/50 p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[#172033]">{copy.testnetHashLabel}</h3>
              {result.selectedPreset === "testnet" ? (
                <Badge tone="success">{copy.activeBadge}</Badge>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onSwitchPassphrase?.("testnet")}
                >
                  {copy.switchToTestnet}
                </Button>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <span className="font-bold text-[#4e5c73]">{copy.hexLabel}:</span>
                <CopyableValue
                  label="testnet hex hash"
                  value={result.testnetHashHex}
                  full
                  className="break-all font-mono"
                />
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <span className="font-bold text-[#4e5c73]">{copy.base64Label}:</span>
                <CopyableValue
                  label="testnet base64 hash"
                  value={result.testnetHashBase64}
                  full
                  className="break-all font-mono"
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border border-[#c7d6e8] bg-white/50 p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[#172033]">{copy.publicHashLabel}</h3>
              {result.selectedPreset === "public" ? (
                <Badge tone="success">{copy.activeBadge}</Badge>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onSwitchPassphrase?.("public")}
                >
                  {copy.switchToPublic}
                </Button>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <span className="font-bold text-[#4e5c73]">{copy.hexLabel}:</span>
                <CopyableValue
                  label="mainnet hex hash"
                  value={result.publicHashHex}
                  full
                  className="break-all font-mono"
                />
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <span className="font-bold text-[#4e5c73]">{copy.base64Label}:</span>
                <CopyableValue
                  label="mainnet base64 hash"
                  value={result.publicHashBase64}
                  full
                  className="break-all font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
