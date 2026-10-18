"use client";

import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CadenceSummary } from "@/features/ledger-close-cadence/components/CadenceSummary";
import { GapNotice } from "@/features/ledger-close-cadence/components/GapNotice";
import { LedgerIntervals } from "@/features/ledger-close-cadence/components/LedgerIntervals";
import { copy } from "@/features/ledger-close-cadence/copy";
import type { LedgerCloseCadenceResult } from "@/features/ledger-close-cadence/types";

export function LedgerCloseCadenceResultView({ result }: { result: LedgerCloseCadenceResult }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.summaryTitle}</CardTitle>
        </CardHeader>
        <CadenceSummary result={result} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.intervalsTitle}</CardTitle>
        </CardHeader>
        <LedgerIntervals intervals={result.intervals} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.gapsTitle}</CardTitle>
        </CardHeader>
        <GapNotice result={result} />
      </Card>
    </div>
  );
}
