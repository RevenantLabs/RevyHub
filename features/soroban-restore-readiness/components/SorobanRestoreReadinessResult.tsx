"use client";

import { Card, CardHeader, CardTitle, DataList, type DataListItem } from "@/core/ui";
import { copy } from "../copy";
import { formatLedger, formatRemainingLedgers } from "../lib/format";
import type { ReadinessReport } from "../types";
import { EntryStateBadge } from "./EntryStateBadge";
import { RestoreRequirements } from "./RestoreRequirements";
import { TemporaryExpiredNotice } from "./TemporaryExpiredNotice";

export function SorobanRestoreReadinessResult({ result }: { result: ReadinessReport }) {
  const hasLiveUntil = result.liveness.kind === "live" || result.liveness.kind === "pending_eviction";

  const items: DataListItem[] = [
    { label: "Contract ID", value: result.contractId, mono: true },
    { label: "Durability", value: result.durability },
    { label: copy.currentLedger, value: formatLedger(result.latestLedger) },
    {
      label: copy.liveUntilLedger,
      value: hasLiveUntil && "liveUntilLedgerSeq" in result.liveness ? formatLedger(result.liveness.liveUntilLedgerSeq) : copy.liveUntilUnknown
    }
  ];

  if (hasLiveUntil && "liveUntilLedgerSeq" in result.liveness) {
    items.push({ label: copy.remaining, value: formatRemainingLedgers(result.liveness.liveUntilLedgerSeq, result.latestLedger) });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <div className="mb-3">
        <EntryStateBadge liveness={result.liveness} />
      </div>
      <DataList items={items} />
      {result.liveness.kind === "expired_temporary" ? (
        <TemporaryExpiredNotice />
      ) : (
        <RestoreRequirements restore={result.restore} />
      )}
    </Card>
  );
}
