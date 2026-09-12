"use client";

import { Badge } from "@/core/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList, type DataListItem } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy } from "@/features/horizon-health/copy";
import {
  formatLag,
  formatLedgerNumber,
  formatLedgerRange,
  formatRateLimitReset,
  formatTimestamp
} from "@/features/horizon-health/lib/format";
import type { HorizonHealthSummary } from "@/features/horizon-health/types";

/** Renders comprehensive diagnostic inspection metrics for Horizon endpoint. */
export function HorizonHealthResult({ summary }: { summary: HorizonHealthSummary }) {
  const isDegraded = summary.status === "degraded";

  const overviewItems: DataListItem[] = [
    {
      label: copy.endpointLabel,
      value: summary.endpointUrl,
      mono: true
    },
    {
      label: copy.statusLabel,
      value: (
        <Badge tone={isDegraded ? "warning" : "success"}>
          {isDegraded ? "Degraded" : "Healthy"}
        </Badge>
      )
    },
    {
      label: copy.fetchedAtLabel,
      value: formatTimestamp(summary.fetchedAt)
    }
  ];

  const ledgerItems: DataListItem[] = [
    {
      label: copy.coreLedgerLabel,
      value: formatLedgerNumber(summary.coreLatestLedger),
      mono: true
    },
    {
      label: copy.ingestLedgerLabel,
      value: formatLedgerNumber(summary.ingestLatestLedger),
      mono: true
    },
    {
      label: copy.lagLabel,
      value: (
        <div className="flex flex-wrap items-center gap-2">
          <span>{formatLag(summary.lag)}</span>
          {isDegraded ? (
            <Badge tone="warning">Lagging</Badge>
          ) : (
            <Badge tone="success">In Sync</Badge>
          )}
        </div>
      )
    },
    {
      label: copy.historyRangeLabel,
      value: formatLedgerRange(summary.historyElderLedger, summary.historyLatestLedger),
      mono: true
    },
    ...(summary.historyLatestLedgerClosedAt
      ? [
          {
            label: copy.historyClosedAtLabel,
            value: formatTimestamp(summary.historyLatestLedgerClosedAt)
          }
        ]
      : [])
  ];

  const rateLimitItems: DataListItem[] = summary.rateLimit.hasHeaders
    ? [
        {
          label: copy.rateLimitLimitLabel,
          value: `${summary.rateLimit.limit ?? "—"} requests`,
          mono: true
        },
        {
          label: copy.rateLimitRemainingLabel,
          value: `${summary.rateLimit.remaining ?? "—"} requests remaining`,
          mono: true
        },
        {
          label: copy.rateLimitResetLabel,
          value: formatRateLimitReset(summary.rateLimit.reset),
          mono: true
        }
      ]
    : [
        {
          label: copy.rateLimitTitle,
          value: copy.rateLimitAbsent
        }
      ];

  const versionItems: DataListItem[] = [
    {
      label: copy.horizonVersionLabel,
      value: summary.horizonVersion,
      mono: true
    },
    {
      label: copy.coreVersionLabel,
      value: summary.coreVersion,
      mono: true
    },
    ...(summary.currentProtocolVersion !== null
      ? [
          {
            label: copy.protocolVersionLabel,
            value: String(summary.currentProtocolVersion),
            mono: true
          }
        ]
      : []),
    ...(summary.networkPassphrase
      ? [
          {
            label: copy.networkPassphraseLabel,
            value: summary.networkPassphrase,
            mono: true
          }
        ]
      : [])
  ];

  return (
    <div className="space-y-5">
      {isDegraded ? (
        <StatusMessage
          type="warning"
          title={errorCopy.degraded.title}
          description={errorCopy.degraded.description}
        />
      ) : (
        <StatusMessage
          type="success"
          title={copy.healthyTitle}
          description={copy.healthyDescription}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
          <CardDescription>{summary.endpointUrl}</CardDescription>
        </CardHeader>
        <DataList items={overviewItems} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingestion & Ledger State</CardTitle>
          <CardDescription>{copy.thresholdNotice}</CardDescription>
        </CardHeader>
        <DataList items={ledgerItems} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.rateLimitTitle}</CardTitle>
          <CardDescription>{copy.rateLimitDescription}</CardDescription>
        </CardHeader>
        <DataList items={rateLimitItems} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Versions & Protocol</CardTitle>
          <CardDescription>Stellar Core and Horizon software releases</CardDescription>
        </CardHeader>
        <DataList items={versionItems} />
      </Card>
    </div>
  );
}
