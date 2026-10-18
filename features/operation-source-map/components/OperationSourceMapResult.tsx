"use client";

import { Badge } from "@/core/ui/Badge";
import { Button } from "@/core/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CodeBlock } from "@/core/ui/CodeBlock";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList, type DataListItem } from "@/core/ui/DataList";
import { EmptyState } from "@/core/ui/EmptyState";
import { Field } from "@/core/ui/Field";
import { Select } from "@/core/ui/Input";
import { Filter } from "lucide-react";
import { copy, filterLabels, kindLabels } from "@/features/operation-source-map/copy";
import { toJsonSummary } from "@/features/operation-source-map/lib/operationSourceMap";
import {
  formatIndex,
  formatOperationIndexes,
  formatOperationType,
  formatOriginCounts
} from "@/features/operation-source-map/lib/format";
import type {
  AccountIdentity,
  OperationSource,
  SourceFilter,
  SourceMap
} from "@/features/operation-source-map/types";

/**
 * A muxed source contributes extra rows rather than being flattened, so the
 * `M…` address the envelope carries and the `G…` account behind it are both
 * visible without either being mistaken for the other.
 */
function accountRows(label: string, identity: AccountIdentity): DataListItem[] {
  const rows: DataListItem[] = [
    { label, value: <CopyableValue label={copy.copySource} value={identity.address} /> }
  ];

  if (identity.baseAddress) {
    rows.push({
      label: copy.labelBaseAccount,
      value: <CopyableValue label="underlying account" value={identity.baseAddress} />
    });
  }

  if (identity.muxedId) {
    rows.push({ label: copy.labelMuxedId, value: identity.muxedId, mono: true });
  }

  return rows;
}

function OperationRow({ operation }: { operation: OperationSource }) {
  return (
    <li className="space-y-2 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-mono text-xs text-[#8a98aa]">#{formatIndex(operation.index)}</span>
        <span className="font-semibold text-[#172033]">
          {formatOperationType(operation.type)}
        </span>
        <Badge tone={operation.inherited ? "info" : "warning"}>
          {operation.inherited ? copy.originInherited : copy.originOverridden}
        </Badge>
      </div>

      <dl className="grid gap-1 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-3">
        <dt className="text-xs font-bold text-[#4e5c73]">{copy.columnExplicit}</dt>
        <dd className="min-w-0 text-xs text-[#172033]">
          {operation.explicitSource ? (
            <CopyableValue label={copy.copySource} value={operation.explicitSource.address} />
          ) : (
            copy.noExplicitSource
          )}
        </dd>

        <dt className="text-xs font-bold text-[#4e5c73]">{copy.columnEffective}</dt>
        <dd className="min-w-0 text-xs text-[#172033]">
          <CopyableValue label={copy.copySource} value={operation.effectiveSource.address} />
        </dd>
      </dl>
    </li>
  );
}

export function OperationSourceMapResult({
  map,
  filter,
  onFilterChange,
  onResetFilter,
  visibleOperations
}: {
  map: SourceMap;
  filter: SourceFilter;
  onFilterChange: (filter: SourceFilter) => void;
  onResetFilter: () => void;
  visibleOperations: OperationSource[];
}) {
  const summary = toJsonSummary(map);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.overviewTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.labelKind, value: kindLabels[map.kind] },
            ...accountRows(copy.labelTransactionSource, map.transactionSource),
            ...(map.feePayer ? accountRows(copy.labelFeePayer, map.feePayer) : []),
            { label: copy.labelOperationCount, value: String(map.operations.length), mono: true },
            { label: copy.labelInherited, value: String(map.inheritedCount), mono: true },
            { label: copy.labelOverridden, value: String(map.overriddenCount), mono: true }
          ]}
        />
        {map.feePayer ? (
          <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.feeBumpNote}</p>
        ) : null}
        <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.scopeNote}</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.operationsTitle}</CardTitle>
        </CardHeader>

        {map.operations.length ? (
          <>
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <Field label={copy.filterLabel} className="min-w-[14rem] flex-1">
                {({ inputId, describedBy }) => (
                  <Select
                    id={inputId}
                    aria-describedby={describedBy}
                    value={filter}
                    onChange={(event) => onFilterChange(event.target.value as SourceFilter)}
                  >
                    <option value="all">{filterLabels.all}</option>
                    <option value="inherited">{filterLabels.inherited}</option>
                    <option value="overridden">{filterLabels.overridden}</option>
                  </Select>
                )}
              </Field>
              <Button type="button" variant="secondary" onClick={onResetFilter}>
                {copy.reset}
              </Button>
            </div>

            {visibleOperations.length ? (
              <ol className="space-y-2">
                {visibleOperations.map((operation) => (
                  <OperationRow key={operation.index} operation={operation} />
                ))}
              </ol>
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
          </>
        ) : (
          <p className="text-sm leading-6 text-[#4e5c73]">{copy.noOperations}</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.groupsTitle}</CardTitle>
          <CardDescription>{copy.muxedNote}</CardDescription>
        </CardHeader>
        {map.groups.length ? (
          <ul className="space-y-2">
            {map.groups.map((group) => (
              <li
                key={group.source.address}
                className="space-y-1 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm"
              >
                <CopyableValue label={copy.copySource} value={group.source.address} />
                <p className="font-mono text-xs text-[#68758a]">
                  Operations {formatOperationIndexes(group)} — {formatOriginCounts(group)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-[#4e5c73]">{copy.noOperations}</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.exportTitle}</CardTitle>
          <CardDescription>{copy.exportDescription}</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          <CopyableValue label={copy.copyExport} value={summary} visible={12} />
          <CodeBlock label="JSON">{summary}</CodeBlock>
        </div>
      </Card>
    </div>
  );
}
