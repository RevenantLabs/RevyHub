"use client";

import { useState } from "react";
import { Button } from "@/core/ui/Button";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { GapWarnings } from "@/features/ledger-protocol-transition-map/components/GapWarnings";
import { ProtocolRuns } from "@/features/ledger-protocol-transition-map/components/ProtocolRuns";
import { TransitionRows } from "@/features/ledger-protocol-transition-map/components/TransitionRows";
import { copy } from "@/features/ledger-protocol-transition-map/copy";
import {
  formatNetworkLabel,
  formatRange
} from "@/features/ledger-protocol-transition-map/lib/format";
import type { LedgerProtocolTransitionMapResult } from "@/features/ledger-protocol-transition-map/types";

export function LedgerProtocolTransitionMapResultView({
  result
}: {
  result: LedgerProtocolTransitionMapResult;
}) {
  const [copied, setCopied] = useState(false);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(result.summaryText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.summaryTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.networkLabel, value: formatNetworkLabel(result.network) },
            {
              label: copy.rangeLabel,
              value: formatRange(result.startLedger, result.endLedger),
              mono: true
            },
            { label: copy.requestedLabel, value: String(result.requestedCount) },
            { label: copy.observedLabel, value: String(result.observedCount) },
            {
              label: copy.summaryLabel,
              value: (
                <div className="space-y-2">
                  <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-[#f5f8fc] p-2 font-mono text-xs text-[#29364d]">
                    {result.summaryText}
                  </pre>
                  <Button type="button" variant="secondary" onClick={copySummary}>
                    {copied ? copy.copiedSummary : copy.copySummary}
                  </Button>
                </div>
              )
            }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.runsTitle}</CardTitle>
        </CardHeader>
        <ProtocolRuns runs={result.runs} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.transitionsTitle}</CardTitle>
        </CardHeader>
        <TransitionRows transitions={result.transitions} />
      </Card>

      <Card>
        <GapWarnings result={result} />
      </Card>
    </div>
  );
}
