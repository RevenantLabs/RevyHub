"use client";

import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { Badge } from "@/core/ui/Badge";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/contract-storage/copy";
import {
  entryKey,
  formatTimeRemaining,
  groupEntriesByKind
} from "@/features/contract-storage/lib/format";
import type { ContractStorageResult as ContractStorageResultValue, StorageEntry } from "@/features/contract-storage/types";

function StorageTable({ entries }: { entries: StorageEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#e3ebf5]">
            <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
              {copy.keyColumn}
            </th>
            <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
              {copy.valueColumn}
            </th>
            <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
              {copy.liveUntilColumn}
            </th>
            <th scope="col" className="py-2 font-bold text-[#4e5c73]">
              {copy.remainingColumn}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const archived = entry.ledgersRemaining !== null && entry.ledgersRemaining <= 0;

            return (
              <tr key={entryKey(entry, index)} className="border-b border-[#f0f4f9] last:border-0">
                <th scope="row" className="py-3 pr-4 text-left font-mono text-xs font-semibold text-[#172033]">
                  <CopyableValue label="Storage key" value={entry.key} visible={6} />
                </th>
                <td className="py-3 pr-4 font-mono text-xs text-[#172033]">
                  <CopyableValue label="Storage value" value={entry.value} visible={6} />
                </td>
                <td className="py-3 pr-4 font-mono text-[#172033]">
                  {entry.liveUntilLedger ?? <span className="text-[#8a98aa]">—</span>}
                </td>
                <td className="py-3">
                  <span className="flex items-center gap-2">
                    {entry.ledgersRemaining !== null ? (
                      <>
                        <span className="font-mono text-[#172033]">{entry.ledgersRemaining}</span>
                        <span className="text-xs text-[#68758a]">
                          {formatTimeRemaining(entry.ledgersRemaining)}
                        </span>
                      </>
                    ) : (
                      <span className="text-[#8a98aa]">—</span>
                    )}
                    {archived ? <Badge tone="danger">{copy.archivedBadge}</Badge> : null}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StorageSection({
  title,
  entries
}: {
  title: string;
  entries: StorageEntry[];
}) {
  if (!entries.length) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-bold text-[#4e5c73]">{title}</h3>
      <StorageTable entries={entries} />
    </section>
  );
}

export function ContractStorageResult({ result }: { result: ContractStorageResultValue }) {
  const groups = groupEntriesByKind(result.entries);
  const hasAnyEntries = result.entries.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>

      <DataList
        items={[
          { label: copy.contractIdLabel, value: result.contractId, mono: true },
          { label: copy.latestLedgerLabel, value: String(result.latestLedger) },
          { label: copy.entriesCountLabel, value: String(result.entries.length) }
        ]}
      />

      {hasAnyEntries ? (
        <div className="mt-4 space-y-6">
          <StorageSection title={copy.instanceSectionTitle} entries={groups.instance} />
          <StorageSection title={copy.persistentSectionTitle} entries={groups.persistent} />
          <StorageSection title={copy.temporarySectionTitle} entries={groups.temporary} />
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-[#e3ebf5] bg-[#f8fafc] px-4 py-3">
          <p className="font-semibold text-[#172033]">{copy.noEntriesTitle}</p>
          <p className="mt-1 text-sm text-[#4e5c73]">{copy.noEntriesDescription}</p>
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.ttlNote}</p>
      <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.persistentNote}</p>
    </Card>
  );
}
