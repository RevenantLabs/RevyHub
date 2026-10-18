"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/core/ui/Badge";
import { Button } from "@/core/ui/Button";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { Field } from "@/core/ui/Field";
import { Select } from "@/core/ui/Input";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy } from "@/features/payment-csv-preflight/copy";
import { exportRows } from "@/features/payment-csv-preflight/lib/paymentCsvPreflight";
import { shouldRedact } from "@/features/payment-csv-preflight/lib/paymentCsvPreflight.errors";
import {
  filterRows,
  formatAmount,
  formatAssetLabel,
  formatDuplicateLines,
  formatOptionalColumns,
  formatOverview,
  formatRowAdvice,
  hasAmbiguousAssetCodes
} from "@/features/payment-csv-preflight/lib/format";
import type {
  PaymentRow,
  PreflightReport,
  PreflightSource,
  RowFilter
} from "@/features/payment-csv-preflight/types";

const FILTERS: { value: RowFilter; label: string }[] = [
  { value: "all", label: copy.filterAll },
  { value: "valid", label: copy.filterValid },
  { value: "invalid", label: copy.filterInvalid }
];

function statusTone(row: PaymentRow): "success" | "warning" | "danger" {
  if (!row.valid) return "danger";
  return row.duplicateOf.length ? "warning" : "success";
}

function statusLabel(row: PaymentRow): string {
  if (!row.valid) return copy.statusInvalid;
  return row.duplicateOf.length ? copy.statusDuplicate : copy.statusValid;
}

function download(filename: string, json: string) {
  const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function PaymentCsvPreflightResult({
  report,
  source
}: {
  report: PreflightReport;
  source: PreflightSource;
}) {
  const [filter, setFilter] = useState<RowFilter>("all");

  const rows = useMemo(() => filterRows(report.rows, filter), [report.rows, filter]);
  const exported = useMemo(() => exportRows(report), [report]);
  const ambiguous = useMemo(() => hasAmbiguousAssetCodes(report.totals), [report.totals]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.summaryTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.summaryRows, value: String(report.rows.length) },
            { label: copy.summaryValid, value: String(report.validCount) },
            { label: copy.summaryInvalid, value: String(report.invalidCount) },
            { label: copy.summaryDuplicates, value: String(report.duplicateCount) },
            {
              label: copy.summaryOptionalColumns,
              value: formatOptionalColumns(report.optionalColumns)
            },
            {
              label: copy.summarySource,
              value: source.kind === "file" ? copy.sourceFile(source.name) : copy.sourcePasted
            },
            { label: copy.summaryOverview, value: formatOverview(report) }
          ]}
        />
      </Card>

      {ambiguous ? (
        <StatusMessage
          type="warning"
          title={copy.sameCodeWarningTitle}
          description={copy.sameCodeWarningDescription}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{copy.totalsTitle}</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <caption className="sr-only">{copy.totalsCaption}</caption>
            <thead>
              <tr className="border-b border-[#e3ebf5]">
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.columnAsset}
                </th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.columnTotal}
                </th>
                <th scope="col" className="py-2 font-bold text-[#4e5c73]">
                  {copy.columnRows}
                </th>
              </tr>
            </thead>
            <tbody>
              {report.totals.map((total) => (
                <tr key={total.asset.key} className="border-b border-[#f0f4f9] last:border-0">
                  <th scope="row" className="py-3 pr-4 font-semibold text-[#172033]">
                    {formatAssetLabel(total.asset)}
                  </th>
                  <td className="py-3 pr-4 font-mono text-xs text-[#172033]">
                    {formatAmount(total.total)}
                  </td>
                  <td className="py-3 text-[#4e5c73]">{total.rowCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.rowsTitle}</CardTitle>
        </CardHeader>

        <Field label={copy.filterLabel} className="mb-4 max-w-xs">
          {({ inputId }) => (
            <Select
              id={inputId}
              value={filter}
              onChange={(event) => setFilter(event.target.value as RowFilter)}
            >
              {FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </Field>

        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
              <caption className="sr-only">{copy.rowsCaption}</caption>
              <thead>
                <tr className="border-b border-[#e3ebf5]">
                  <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                    {copy.columnRow}
                  </th>
                  <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                    {copy.columnDestination}
                  </th>
                  <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                    {copy.columnAmount}
                  </th>
                  <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                    {copy.columnAsset}
                  </th>
                  <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                    {copy.columnStatus}
                  </th>
                  <th scope="col" className="py-2 font-bold text-[#4e5c73]">
                    {copy.columnAdvice}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.line} className="border-b border-[#f0f4f9] last:border-0">
                    <th scope="row" className="py-3 pr-4 font-semibold text-[#172033]">
                      {copy.rowPosition(row.index, row.line)}
                    </th>
                    <td className="py-3 pr-4">
                      {shouldRedact(row.issues) || !row.destination ? (
                        <span className="text-[#8a98aa]">{copy.secretRow}</span>
                      ) : (
                        <CopyableValue
                          label={copy.rowLabel(row.index)}
                          value={row.destination}
                          visible={6}
                        />
                      )}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-[#172033]">{row.amount}</td>
                    <td className="py-3 pr-4 text-[#4e5c73]">{formatAssetLabel(row.asset)}</td>
                    <td className="py-3 pr-4">
                      <Badge tone={statusTone(row)}>{statusLabel(row)}</Badge>
                    </td>
                    <td className="py-3 text-[#4e5c73]">
                      <span>{formatRowAdvice(row.issues)}</span>
                      {row.duplicateOf.length ? (
                        <p className="mt-1 text-xs text-[#8a98aa]">
                          {formatDuplicateLines(row.duplicateOf)}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#68758a]">{copy.filterEmpty}</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.exportTitle}</CardTitle>
        </CardHeader>

        {exported.ok ? (
          <div className="space-y-3">
            <p className="text-sm leading-6 text-[#4e5c73]">{copy.exportDescription}</p>
            <textarea
              readOnly
              aria-label={copy.exportLabel}
              value={exported.value}
              rows={8}
              className="w-full rounded-md border border-[#c7d6e8] bg-[#f7fafd] p-3 font-mono text-xs text-[#172033]"
            />
            <Button type="button" onClick={() => download(copy.exportFilename, exported.value)}>
              {copy.exportAction}
            </Button>
          </div>
        ) : (
          <StatusMessage
            type="warning"
            title={errorCopy[exported.code].title}
            description={errorCopy[exported.code].description}
          />
        )}
      </Card>

      <StatusMessage type="info" title={copy.limitsTitle} description={copy.limitsDescription} />
    </div>
  );
}
