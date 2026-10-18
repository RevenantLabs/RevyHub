"use client";

import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/ledger-close-cadence/copy";
import {
  formatCount,
  formatDurationMs,
  formatLedgerLabel,
  formatNetworkLabel
} from "@/features/ledger-close-cadence/lib/format";
import type { LedgerCloseCadenceResult } from "@/features/ledger-close-cadence/types";

export function CadenceSummary({ result }: { result: LedgerCloseCadenceResult }) {
  return (
    <DataList
      items={[
        { label: copy.networkLabel, value: formatNetworkLabel(result.network) },
        { label: copy.sampleSizeLabel, value: formatCount(result.requestedSampleSize) },
        { label: copy.observedSizeLabel, value: formatCount(result.observedSampleSize) },
        {
          label: copy.firstLedgerLabel,
          value: formatLedgerLabel(result.firstLedger.sequence, result.firstLedger.closedAt),
          mono: true
        },
        {
          label: copy.lastLedgerLabel,
          value: formatLedgerLabel(result.lastLedger.sequence, result.lastLedger.closedAt),
          mono: true
        },
        { label: copy.medianLabel, value: formatDurationMs(result.stats.medianMs) },
        { label: copy.minLabel, value: formatDurationMs(result.stats.minMs) },
        { label: copy.maxLabel, value: formatDurationMs(result.stats.maxMs) },
        { label: copy.intervalCountLabel, value: formatCount(result.stats.intervalCount) },
        { label: copy.malformedLabel, value: formatCount(result.malformedCount) },
        { label: copy.repeatedLabel, value: formatCount(result.repeatedTimestampCount) }
      ]}
    />
  );
}
