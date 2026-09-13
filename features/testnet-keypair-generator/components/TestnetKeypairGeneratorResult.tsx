"use client";

import { useState } from "react";
import { Eye, EyeOff, Download, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { Button } from "@/core/ui/Button";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/testnet-keypair-generator/copy";
import {
  formatKeypairExportJson,
  formatNetworkStatus,
  maskSecret
} from "@/features/testnet-keypair-generator/lib/format";
import type { TestnetKeypairGeneratorResult as ResultValue } from "@/features/testnet-keypair-generator/types";

export function TestnetKeypairGeneratorResult({ result }: { result: ResultValue }) {
  const [revealed, setRevealed] = useState(false);

  function handleDownload() {
    const json = formatKeypairExportJson(result);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stellar-testnet-${result.publicKey.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const items = [
    ...(result.label
      ? [{ label: copy.labelFieldLabel, value: result.label }]
      : []),
    {
      label: copy.publicKeyLabel,
      value: (
        <CopyableValue
          label={copy.publicKeyLabel}
          value={result.publicKey}
          full
        />
      )
    },
    {
      label: copy.secretSeedLabel,
      value: (
        <div className="flex flex-wrap items-center gap-2">
          {revealed ? (
            <CopyableValue
              label={copy.secretSeedLabel}
              value={result.secretSeed}
              full
            />
          ) : (
            <span className="font-mono text-xs text-muted-foreground">
              {maskSecret(result.secretSeed)}
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setRevealed((prev) => !prev)}
            aria-label={revealed ? copy.hideSecret : copy.revealSecret}
          >
            {revealed ? (
              <EyeOff className="h-3.5 w-3.5 mr-1" aria-hidden />
            ) : (
              <Eye className="h-3.5 w-3.5 mr-1" aria-hidden />
            )}
            {revealed ? copy.hideSecret : copy.revealSecret}
          </Button>
        </div>
      )
    },
    {
      label: copy.networkLabel,
      value: (
        <span className="font-mono text-xs font-semibold uppercase text-accent">
          {result.network}
        </span>
      )
    },
    {
      label: copy.ledgerStatusLabel,
      value: (
        <span className="text-xs font-medium">
          {formatNetworkStatus(result.networkCheckStatus)}
        </span>
      )
    },
    {
      label: copy.friendbotLabel,
      value: (
        <a
          href={result.friendbotUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          {copy.fundWithFriendbot}
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <StatusMessage
        type="warning"
        title={copy.securityAlertTitle}
        description={copy.securityAlertDescription}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{copy.resultTitle}</CardTitle>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            aria-label={copy.downloadJson}
          >
            <Download className="h-3.5 w-3.5 mr-1" aria-hidden />
            {copy.downloadJson}
          </Button>
        </CardHeader>
        <DataList items={items} />
      </Card>
    </div>
  );
}
