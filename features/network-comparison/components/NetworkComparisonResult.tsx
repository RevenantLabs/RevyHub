"use client";

import { Badge } from "@/core/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/network-comparison/copy";
import {
  formatAmountDifference,
  formatFeeAmount,
  formatIngestionState,
  formatLedgerSequence,
  formatObservationTime,
  formatProtocolVersion,
  formatReserveAmount
} from "@/features/network-comparison/lib/format";
import type {
  NetworkComparisonResult as NetworkComparisonData,
  NetworkSnapshot
} from "@/features/network-comparison/types";

export interface NetworkComparisonResultProps {
  data: NetworkComparisonData;
}

/**
 * Renders data fields for a single network snapshot.
 *
 * @param snapshot - The network snapshot to display.
 * @returns Rendered DataList or error status message.
 */
function NetworkColumn({ snapshot }: { snapshot: NetworkSnapshot }) {
  if (snapshot.status === "unreachable") {
    return (
      <StatusMessage
        type="error"
        title={copy.columnStatusUnreachable}
        description={snapshot.error}
      />
    );
  }

  const items = [
    {
      label: copy.observedAtLabel,
      value: formatObservationTime(snapshot.observedAt)
    },
    {
      label: copy.ledgerSequenceLabel,
      value: formatLedgerSequence(snapshot.ledgerSequence)
    },
    {
      label: copy.closedAtLabel,
      value: formatObservationTime(snapshot.closedAt)
    },
    {
      label: copy.protocolVersionLabel,
      value: formatProtocolVersion(snapshot.protocolVersion)
    },
    {
      label: copy.coreSupportedVersionLabel,
      value: formatProtocolVersion(snapshot.coreSupportedProtocolVersion)
    },
    {
      label: copy.baseFeeLabel,
      value: formatFeeAmount(snapshot.baseFeeInStroops)
    },
    {
      label: copy.baseReserveLabel,
      value: formatReserveAmount(snapshot.baseReserveInStroops)
    },
    {
      label: copy.ingestionStateLabel,
      value: formatIngestionState(snapshot.ingestLatestLedger, snapshot.historyLatestLedger)
    },
    {
      label: copy.horizonVersionLabel,
      value: snapshot.horizonVersion ?? copy.unavailable
    },
    {
      label: copy.coreVersionLabel,
      value: snapshot.coreVersion ?? copy.unavailable
    }
  ];

  return <DataList items={items} />;
}

/**
 * Side-by-side comparison view for Testnet and Mainnet.
 * Highlights protocol differences, fee/reserve comparisons, and testnet resets.
 *
 * @param props - Result data properties.
 * @returns Rendered comparison results.
 */
export function NetworkComparisonResult({ data }: NetworkComparisonResultProps) {
  const { testnet, mainnet, protocolComparison, baseFeeComparison, baseReserveComparison } = data;

  return (
    <div className="space-y-6">
      {protocolComparison.hasDifference &&
      protocolComparison.testnetProtocol !== null &&
      protocolComparison.mainnetProtocol !== null ? (
        <StatusMessage
          type="warning"
          title={copy.protocolDifferenceBadge}
          description={copy.protocolDifferenceAlert(
            protocolComparison.testnetProtocol,
            protocolComparison.mainnetProtocol
          )}
        />
      ) : null}

      {!protocolComparison.hasDifference &&
      protocolComparison.testnetProtocol !== null &&
      testnet.status === "online" &&
      mainnet.status === "online" ? (
        <StatusMessage
          type="info"
          title={copy.protocolSyncedBadge}
          description={copy.protocolSyncedAlert(protocolComparison.testnetProtocol)}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>{copy.testnetColumnTitle}</CardTitle>
            <Badge tone={testnet.status === "online" ? "success" : "danger"}>
              {testnet.status === "online"
                ? copy.columnStatusOnline
                : copy.columnStatusUnreachable}
            </Badge>
          </CardHeader>
          <NetworkColumn snapshot={testnet} />
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>{copy.mainnetColumnTitle}</CardTitle>
            <Badge tone={mainnet.status === "online" ? "success" : "danger"}>
              {mainnet.status === "online"
                ? copy.columnStatusOnline
                : copy.columnStatusUnreachable}
            </Badge>
          </CardHeader>
          <NetworkColumn snapshot={mainnet} />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{copy.summaryTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.protocolDifferenceSummary,
              value: protocolComparison.hasDifference
                ? `Testnet (v${protocolComparison.testnetProtocol}) vs Mainnet (v${protocolComparison.mainnetProtocol})`
                : copy.identical
            },
            {
              label: copy.feeDifferenceSummary,
              value: formatAmountDifference(baseFeeComparison.differenceStroops)
            },
            {
              label: copy.reserveDifferenceSummary,
              value: formatAmountDifference(baseReserveComparison.differenceStroops)
            }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.testnetResetTitle}</CardTitle>
          <CardDescription>{copy.testnetResetDescription}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
