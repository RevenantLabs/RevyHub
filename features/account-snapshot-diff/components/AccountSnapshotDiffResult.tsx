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
  changeFilterLabels,
  changeLabels,
  copy,
  sectionLabels
} from "@/features/account-snapshot-diff/copy";
import { toJsonSummary } from "@/features/account-snapshot-diff/lib/accountSnapshotDiff";
import {
  changesInSection,
  formatBalanceKey,
  formatDelta,
  formatValue,
  groupByKey,
  occupiedSections
} from "@/features/account-snapshot-diff/lib/format";
import type {
  ChangeFilter,
  SectionFilter,
  SnapshotChange,
  SnapshotDiff,
  SnapshotSection
} from "@/features/account-snapshot-diff/types";

const TONES = {
  added: "success",
  removed: "danger",
  changed: "warning",
  unchanged: "muted"
} as const;

function ChangeRow({ change }: { change: SnapshotChange }) {
  return (
    <li className="space-y-1 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-xs font-semibold text-[#172033]">{change.field}</span>
        <Badge tone={TONES[change.type]}>{changeLabels[change.type]}</Badge>
        {change.delta ? (
          <span className="font-mono text-xs font-bold text-[#146783]">
            {formatDelta(change.delta)}
          </span>
        ) : null}
      </div>

      {change.type === "unchanged" ? (
        <p className="font-mono text-xs text-[#4e5c73]">{formatValue(change.before)}</p>
      ) : (
        <p className="font-mono text-xs text-[#4e5c73]">
          <span className="text-[#9f342d]">{formatValue(change.before)}</span>
          {" → "}
          <span className="text-[#17664b]">{formatValue(change.after)}</span>
        </p>
      )}
    </li>
  );
}

function SectionBlock({
  section,
  changes
}: {
  section: SnapshotSection;
  changes: SnapshotChange[];
}) {
  const groups = groupByKey(changesInSection(changes, section));

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-bold text-[#4e5c73]">{sectionLabels[section]}</h3>

      {[...groups.entries()].map(([key, rows]) => (
        <div key={key} className="space-y-2">
          {/*
            The account, thresholds and flags sections have exactly one
            identity, so repeating it above every group would be noise.
          */}
          {section === "balances" || section === "signers" || section === "data" ? (
            <p className="break-words font-mono text-xs font-bold text-[#172033]">
              {section === "balances" ? formatBalanceKey(key) : key}
            </p>
          ) : null}
          <ol className="space-y-2">
            {rows.map((change) => (
              <ChangeRow key={`${change.key}|${change.field}`} change={change} />
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}

export function AccountSnapshotDiffResult({
  diff,
  section,
  onSectionChange,
  changeFilter,
  onChangeFilterChange,
  onResetFilters,
  visibleChanges
}: {
  diff: SnapshotDiff;
  section: SectionFilter;
  onSectionChange: (section: SectionFilter) => void;
  changeFilter: ChangeFilter;
  onChangeFilterChange: (filter: ChangeFilter) => void;
  onResetFilters: () => void;
  visibleChanges: SnapshotChange[];
}) {
  const json = toJsonSummary(diff);
  const sections = occupiedSections(visibleChanges);

  return (
    <div className="space-y-4">
      {diff.identical ? (
        <StatusMessage
          type="success"
          title={copy.identicalTitle}
          description={copy.identicalDescription}
        />
      ) : null}

      {diff.unsupportedFields.length ? (
        <StatusMessage
          type="info"
          title={copy.unsupportedTitle}
          description={`${copy.unsupportedDescription} ${diff.unsupportedFields.join(", ")}`}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{copy.overviewTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.labelAccount,
              value: <CopyableValue label={copy.copyAccount} value={diff.accountId} />
            },
            { label: copy.labelChanged, value: String(diff.changedCount), mono: true },
            { label: copy.labelUnchanged, value: String(diff.unchangedCount), mono: true }
          ]}
        />
        <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.observationNote}</p>
        <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.orderNote}</p>
        <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.absenceNote}</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.changesTitle}</CardTitle>
        </CardHeader>

        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Field label={copy.sectionFilterLabel} className="min-w-[12rem] flex-1">
            {({ inputId, describedBy }) => (
              <Select
                id={inputId}
                aria-describedby={describedBy}
                value={section}
                onChange={(event) => onSectionChange(event.target.value as SectionFilter)}
              >
                <option value="all">{copy.filterAllSections}</option>
                {(Object.keys(sectionLabels) as SnapshotSection[]).map((name) => (
                  <option key={name} value={name}>
                    {sectionLabels[name]}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label={copy.changeFilterLabel} className="min-w-[12rem] flex-1">
            {({ inputId, describedBy }) => (
              <Select
                id={inputId}
                aria-describedby={describedBy}
                value={changeFilter}
                onChange={(event) => onChangeFilterChange(event.target.value as ChangeFilter)}
              >
                <option value="all">{changeFilterLabels.all}</option>
                <option value="changed">{changeFilterLabels.changed}</option>
                <option value="unchanged">{changeFilterLabels.unchanged}</option>
              </Select>
            )}
          </Field>

          <Button type="button" variant="secondary" onClick={onResetFilters}>
            {copy.reset}
          </Button>
        </div>

        {visibleChanges.length ? (
          <div className="space-y-5">
            {sections.map((name) => (
              <SectionBlock key={name} section={name} changes={visibleChanges} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Filter}
            title={copy.noMatchTitle}
            description={copy.noMatchDescription}
            action={
              <Button type="button" variant="secondary" onClick={onResetFilters}>
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
