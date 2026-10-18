import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, kindLabels, sectionLabels } from "@/features/transaction-size-analyzer/copy";
import {
  base64Overhead,
  formatBytes,
  formatCharacters,
  formatOperationLabel,
  formatShare,
  formatSignatureLabel,
  sectionsTotal
} from "@/features/transaction-size-analyzer/lib/format";
import type { LayerBreakdown, SizeReport } from "@/features/transaction-size-analyzer/types";

function SectionTable({ layer, title }: { layer: LayerBreakdown; title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{formatBytes(layer.totalBytes)}</CardDescription>
      </CardHeader>

      <DataList
        items={[
          ...layer.sections.map((section) => ({
            label: sectionLabels[section.key],
            value: `${formatBytes(section.bytes)} · ${formatShare(section, layer.totalBytes)}`,
            mono: true
          })),
          {
            label: copy.labelSectionTotal,
            value: formatBytes(sectionsTotal(layer)),
            mono: true
          }
        ]}
      />
    </Card>
  );
}

function ElementList({
  title,
  labels,
  emptyMessage
}: {
  title: string;
  labels: string[];
  emptyMessage: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {labels.length ? (
        <ol className="space-y-2">
          {labels.map((label, index) => (
            <li
              key={`${label}-${index}`}
              className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 font-mono text-xs text-[#172033]"
            >
              {label}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm leading-6 text-[#4e5c73]">{emptyMessage}</p>
      )}
    </Card>
  );
}

export function TransactionSizeAnalyzerResult({ report }: { report: SizeReport }) {
  // A fee bump's operations live on the inner transaction; a classic envelope
  // carries its own. Either way there is exactly one operation vector to show.
  const operationLayer = report.inner ?? report.outer;

  return (
    <div className="space-y-4">
      {report.budget ? (
        <StatusMessage
          type={report.budget.withinBudget ? "success" : "warning"}
          title={report.budget.withinBudget ? copy.budgetOkTitle : copy.budgetOverTitle}
          description={
            report.budget.withinBudget
              ? `${formatBytes(report.budget.headroomBytes)} of headroom against a ${formatBytes(
                  report.budget.budgetBytes
                )} budget.`
              : `${formatBytes(report.budget.overageBytes)} over a ${formatBytes(
                  report.budget.budgetBytes
                )} budget.`
          }
        />
      ) : null}

      {report.breakdownComplete ? null : (
        <StatusMessage
          type="info"
          title={copy.unsupportedBreakdownTitle}
          description={copy.unsupportedBreakdownDescription}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>{copy.totalsTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.labelKind, value: kindLabels[report.kind] },
            {
              label: copy.labelTotalBytes,
              value: (
                <CopyableValue
                  label={copy.copyTotal}
                  value={String(report.totalBytes)}
                  full
                />
              )
            },
            {
              label: copy.labelNormalizedBase64,
              value: `${formatCharacters(report.normalizedBase64Length)} (+${formatBytes(
                base64Overhead(report.totalBytes, report.normalizedBase64Length)
              )} of encoding)`,
              mono: true
            },
            {
              label: copy.labelPastedBase64,
              value: formatCharacters(report.pastedBase64Length),
              mono: true
            },
            {
              label: copy.labelOperationCount,
              value: String(operationLayer.operationCount),
              mono: true
            },
            {
              label: copy.labelSignatureCount,
              value: String(
                report.outer.signatureCount + (report.inner?.signatureCount ?? 0)
              ),
              mono: true
            }
          ]}
        />
        <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.base64Note}</p>
      </Card>

      {report.breakdownComplete ? (
        <>
          <SectionTable layer={report.outer} title={copy.outerTitle} />
          {report.inner ? <SectionTable layer={report.inner} title={copy.innerTitle} /> : null}

          <Card>
            <p className="text-xs leading-5 text-[#68758a]">{copy.sumNote}</p>
            {report.inner ? (
              <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.innerNote}</p>
            ) : null}
          </Card>
        </>
      ) : null}

      <ElementList
        title={copy.operationsTitle}
        labels={operationLayer.operationBytes.map((bytes, index) =>
          formatOperationLabel(index, bytes)
        )}
        emptyMessage={copy.noOperations}
      />

      <ElementList
        title={copy.signaturesTitle}
        labels={[
          ...report.outer.signatureBytes.map((bytes, index) =>
            formatSignatureLabel(index, bytes)
          ),
          ...(report.inner?.signatureBytes ?? []).map((bytes, index) =>
            formatSignatureLabel(report.outer.signatureBytes.length + index, bytes)
          )
        ]}
        emptyMessage={copy.noSignatures}
      />

      {report.budget ? (
        <Card>
          <CardHeader>
            <CardTitle>{copy.budgetTitle}</CardTitle>
          </CardHeader>
          <DataList
            items={[
              { label: copy.labelBudget, value: formatBytes(report.budget.budgetBytes), mono: true },
              {
                label: report.budget.withinBudget ? copy.labelHeadroom : copy.labelOverage,
                value: formatBytes(
                  report.budget.withinBudget
                    ? report.budget.headroomBytes
                    : report.budget.overageBytes
                ),
                mono: true
              }
            ]}
          />
          <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.budgetNote}</p>
        </Card>
      ) : null}
    </div>
  );
}
