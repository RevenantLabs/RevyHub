"use client";

import { Filter } from "lucide-react";
import { Badge } from "@/core/ui/Badge";
import { Button } from "@/core/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CodeBlock } from "@/core/ui/CodeBlock";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { EmptyState } from "@/core/ui/EmptyState";
import { Field } from "@/core/ui/Field";
import { Select } from "@/core/ui/Input";
import { StatusMessage } from "@/core/ui/StatusMessage";
import {
  copy,
  filterLabels,
  kindLabels,
  sectionLabels,
  statusLabels
} from "@/features/transaction-envelope-diff/copy";
import { toJsonSummary } from "@/features/transaction-envelope-diff/lib/envelopeDiff";
import {
  entriesInSection,
  formatSide,
  occupiedSections,
  statusTone
} from "@/features/transaction-envelope-diff/lib/format";
import type {
  DiffEntry,
  DiffFilter,
  DiffSummary
} from "@/features/transaction-envelope-diff/types";

function EntryRow({ entry }: { entry: DiffEntry }) {
  return (
    <li className="space-y-2 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-mono text-xs font-semibold text-[#172033]">{entry.path}</span>
        <Badge tone={statusTone(entry.status)}>{statusLabels[entry.status]}</Badge>
      </div>

      {entry.status === "unchanged" ? (
        <p className="min-w-0 break-words font-mono text-xs text-[#4e5c73]">
          {formatSide(entry.before)}
        </p>
      ) : (
        <dl className="grid gap-1 sm:grid-cols-[minmax(0,5rem)_1fr] sm:gap-3">
          <dt className="text-xs font-bold text-[#4e5c73]">{copy.columnBefore}</dt>
          <dd className="min-w-0 break-words font-mono text-xs text-[#9f342d]">
            {formatSide(entry.before)}
          </dd>
          <dt className="text-xs font-bold text-[#4e5c73]">{copy.columnAfter}</dt>
          <dd className="min-w-0 break-words font-mono text-xs text-[#17664b]">
            {formatSide(entry.after)}
          </dd>
        </dl>
      )}
    </li>
  );
}

export function TransactionEnvelopeDiffResult({
  summary,
  filter,
  onFilterChange,
  onResetFilter,
  visibleEntries
}: {
  summary: DiffSummary;
  filter: DiffFilter;
  onFilterChange: (filter: DiffFilter) => void;
  onResetFilter: () => void;
  visibleEntries: DiffEntry[];
}) {
  const json = toJsonSummary(summary);
  const sections = occupiedSections(visibleEntries);
  const kindChanged = summary.leftKind !== summary.rightKind;

  return (
    <div className="space-y-4">
      {summary.identical ? (
        <StatusMessage
          type="success"
          title={copy.identicalTitle}
          description={copy.identicalDescription}
        />
      ) : null}

      {summary.signaturesOnly ? (
        <StatusMessage
          type="info"
          title={copy.signaturesOnlyTitle}
          description={copy.signaturesOnlyDescription}
        />
      ) : null}

      {kindChanged ? (
        <StatusMessage
          type="warning"
          title={copy.kindChangedTitle}
          description={copy.kindChangedDescription}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{copy.overviewTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.labelLeftKind, value: kindLabels[summary.leftKind] },
            { label: copy.labelRightKind, value: kindLabels[summary.rightKind] },
            { label: copy.labelChanged, value: String(summary.changedCount), mono: true },
            { label: copy.labelUnchanged, value: String(summary.unchangedCount), mono: true },
            { label: copy.labelPassphrase, value: summary.networkPassphrase }
          ]}
        />
        <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.orderNote}</p>
        <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.unknownFieldNote}</p>
        <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.signatureSectionNote}</p>
        {summary.leftKind === "fee-bump" || summary.rightKind === "fee-bump" ? (
          <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.layerNote}</p>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.changesTitle}</CardTitle>
        </CardHeader>

        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Field label={copy.filterLabel} className="min-w-[14rem] flex-1">
            {({ inputId, describedBy }) => (
              <Select
                id={inputId}
                aria-describedby={describedBy}
                value={filter}
                onChange={(event) => onFilterChange(event.target.value as DiffFilter)}
              >
                <option value="all">{filterLabels.all}</option>
                <option value="changed">{filterLabels.changed}</option>
                <option value="unchanged">{filterLabels.unchanged}</option>
              </Select>
            )}
          </Field>
          <Button type="button" variant="secondary" onClick={onResetFilter}>
            {copy.reset}
          </Button>
        </div>

        {visibleEntries.length ? (
          <div className="space-y-5">
            {sections.map((section) => (
              <section key={section} className="space-y-2">
                <h3 className="text-sm font-bold text-[#4e5c73]">{sectionLabels[section]}</h3>
                <ol className="space-y-2">
                  {entriesInSection(visibleEntries, section).map((entry) => (
                    <EntryRow key={entry.path} entry={entry} />
                  ))}
                </ol>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Filter}
            title={copy.noMatchTitle}
            description={copy.noMatchDescription}
            action={
              <Button type="button" variant="secondary" onClick={onResetFilter}>
                {copy.reset}
              </Button>
            }
          />
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.exportTitle}</CardTitle>
          <CardDescription>{copy.exportDescription}</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          <CopyableValue label={copy.copyExport} value={json} visible={12} />
          <CodeBlock label="JSON">{json}</CodeBlock>
        </div>
      </Card>
    </div>
  );
}
