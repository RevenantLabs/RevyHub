"use client";

import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { Badge } from "@/core/ui/Badge";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/simulation-explainer/copy";
import {
  formatCount,
  formatOutcomeKind,
  formatStroopsToXlm,
  totalLedgerEntries
} from "@/features/simulation-explainer/lib/format";
import type { SimulationExplainerResult as SimulationExplainerResultValue } from "@/features/simulation-explainer/types";

function SuccessResult({ result }: { result: Extract<SimulationExplainerResultValue, { kind: "success" }> }) {
  return (
    <div className="space-y-6">
      <DataList
        items={[
          { label: copy.outcomeLabel, value: formatOutcomeKind("success") },
          { label: copy.latestLedgerLabel, value: String(result.latestLedger) },
          {
            label: copy.minResourceFeeLabel,
            value: `${formatStroopsToXlm(result.minResourceFee)} XLM (${formatCount(result.minResourceFee)} stroops)`
          },
          {
            label: copy.baseFeeLabel,
            value: `${formatStroopsToXlm(result.baseFee)} XLM`
          }
        ]}
      />

      <section>
        <h3 className="mb-2 text-sm font-bold text-[#4e5c73]">{copy.resourcesTitle}</h3>
        <DataList
          items={[
            { label: copy.cpuInstructionsLabel, value: formatCount(result.resources.cpuInstructions) },
            { label: copy.memoryBytesLabel, value: formatCount(result.resources.memoryBytes) },
            { label: copy.readBytesLabel, value: formatCount(result.resources.readBytes) },
            { label: copy.writeBytesLabel, value: formatCount(result.resources.writeBytes) },
            { label: copy.ledgerReadEntriesLabel, value: String(result.resources.ledgerReadEntries) },
            { label: copy.ledgerWriteEntriesLabel, value: String(result.resources.ledgerWriteEntries) },
            { label: copy.ledgerEntryReadBytesLabel, value: formatCount(result.resources.ledgerEntryReadBytes) },
            { label: copy.ledgerEntryWriteBytesLabel, value: formatCount(result.resources.ledgerEntryWriteBytes) },
            {
              label: "Total ledger entries",
              value: String(totalLedgerEntries(result.resources))
            }
          ]}
        />
      </section>

      <section>
        <h3 className="mb-2 text-sm font-bold text-[#4e5c73]">{copy.authTitle}</h3>
        {result.authEntries.length ? (
          <ul className="space-y-2">
            {result.authEntries.map((entry, index) => (
              <li key={index} className="rounded-md border border-[#e3ebf5] bg-[#f8fafc] p-3 text-sm">
                {entry.accountId ? (
                  <CopyableValue label="Account" value={entry.accountId} visible={6} />
                ) : entry.contractId ? (
                  <CopyableValue label="Contract" value={entry.contractId} visible={6} />
                ) : (
                  <span className="text-[#8a98aa]">Unknown signer</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#4e5c73]">{copy.noAuthTitle}</p>
        )}
      </section>

      {result.returnValue ? (
        <section>
          <h3 className="mb-2 text-sm font-bold text-[#4e5c73]">{copy.returnValueLabel}</h3>
          <CopyableValue label="Return value" value={result.returnValue} visible={8} />
        </section>
      ) : null}

      <section>
        <h3 className="mb-2 text-sm font-bold text-[#4e5c73]">{copy.eventsTitle}</h3>
        {result.events.length ? (
          <ul className="space-y-2">
            {result.events.map((event, index) => (
              <li key={index}>
                <CopyableValue label={`Event ${index + 1}`} value={event} visible={6} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#4e5c73]">{copy.noEventsTitle}</p>
        )}
      </section>

      <p className="text-xs leading-5 text-[#68758a]">{copy.baseFeeNote}</p>
    </div>
  );
}

function FailureResult({ result }: { result: Extract<SimulationExplainerResultValue, { kind: "failure" }> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#172033]">{formatOutcomeKind("failure")}</span>
        <Badge tone="danger">Failed</Badge>
      </div>
      <DataList
        items={[
          { label: copy.errorCodeLabel, value: result.errorCode, mono: true },
          { label: copy.errorMessageLabel, value: result.errorMessage }
        ]}
      />
    </div>
  );
}

function RestoreResult({ result }: { result: Extract<SimulationExplainerResultValue, { kind: "restore" }> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#172033]">{formatOutcomeKind("restore")}</span>
        <Badge tone="warning">Restore</Badge>
      </div>
      <p className="text-sm text-[#4e5c73]">{copy.restoreDescription}</p>
      <DataList
        items={[
          { label: copy.latestLedgerLabel, value: String(result.latestLedger) },
          {
            label: copy.minResourceFeeLabel,
            value: `${formatStroopsToXlm(result.minResourceFee)} XLM (${formatCount(result.minResourceFee)} stroops)`
          }
        ]}
      />
    </div>
  );
}

export function SimulationExplainerResult({
  result
}: {
  result: SimulationExplainerResultValue;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>

      {result.kind === "success" ? <SuccessResult result={result} /> : null}
      {result.kind === "failure" ? <FailureResult result={result} /> : null}
      {result.kind === "restore" ? <RestoreResult result={result} /> : null}
    </Card>
  );
}
