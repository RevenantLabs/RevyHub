"use client";

import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { Badge } from "@/core/ui/Badge";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/contract-events/copy";
import {
  formatClosedAt,
  formatEventType,
  formatLedgerRange
} from "@/features/contract-events/lib/format";
import type {
  ContractEvent,
  ContractEventsResult as ContractEventsResultValue
} from "@/features/contract-events/types";

function eventTypeTone(type: ContractEvent["type"]) {
  switch (type) {
    case "contract":
      return "info";
    case "system":
      return "success";
    case "diagnostic":
      return "muted";
  }
}

export function ContractEventsResult({ result }: { result: ContractEventsResultValue }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>

        <DataList
          items={[
            {
              label: copy.contractIdLabel,
              value: <CopyableValue label="contract ID" value={result.contractId} />,
              mono: true
            },
            {
              label: copy.rangeLabel,
              value: formatLedgerRange(result.startLedger, result.endLedger)
            },
            { label: copy.latestLedgerLabel, value: String(result.latestLedger) },
            {
              label: copy.retentionWindowLabel,
              value: `${result.retentionWindow.toLocaleString()} ledgers`
            },
            { label: copy.eventTableCaption, value: copy.eventCount(result.events.length) }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.eventCount(result.events.length)}</CardTitle>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <caption className="sr-only">{copy.eventTableCaption}</caption>
            <thead>
              <tr className="border-b border-[#e3ebf5]">
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.ledgerColumn}
                </th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.typeColumn}
                </th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.topicColumn}
                </th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.valueColumn}
                </th>
                <th scope="col" className="py-2 font-bold text-[#4e5c73]">
                  {copy.callColumn}
                </th>
              </tr>
            </thead>
            <tbody>
              {result.events.map((event) => (
                <tr key={event.id} className="border-b border-[#f0f4f9] last:border-0">
                  <td className="py-3 pr-4 font-mono text-xs">
                    {event.ledger.toLocaleString()}
                    {event.closedAt ? (
                      <span className="block text-xs text-[#8a98aa]">
                        {formatClosedAt(event.closedAt)}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge tone={eventTypeTone(event.type)}>
                      {formatEventType(event.type)}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">
                    {event.topic.length ? event.topic.join(", ") : "-"}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs break-all">
                    <CopyableValue label="event value" value={event.value} visible={12} />
                  </td>
                  <td className="py-3">
                    <Badge tone={event.successful ? "success" : "danger"}>
                      {event.successful ? copy.successfulCall : copy.failedCall}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

