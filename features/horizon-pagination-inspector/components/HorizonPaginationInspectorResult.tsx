import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CodeBlock,
  CopyableValue,
  DataList,
  StatusMessage
} from "@/core/ui";
import { copy } from "@/features/horizon-pagination-inspector/copy";
import {
  formatCursorDisplay,
  formatLinkRel,
  formatRecordCount,
  toJsonSummary
} from "@/features/horizon-pagination-inspector/lib/format";
import type {
  HorizonPaginationReport,
  ParsedLink,
  RecordInspection
} from "@/features/horizon-pagination-inspector/types";

function LinkRow({ link }: { link: ParsedLink }) {
  return (
    <li className="space-y-2 rounded-lg border border-[#e3ebf5] bg-white/70 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-[#172033]">
          {formatLinkRel(link.rel)}
        </span>
        {link.isOffOrigin && (
          <Badge tone="warning">{copy.badgeOffOrigin}</Badge>
        )}
        {link.isHostileScheme && (
          <Badge tone="danger">{copy.badgeHostile}</Badge>
        )}
        {link.templated && (
          <Badge tone="info">{copy.badgeTemplated}</Badge>
        )}
      </div>

      <dl className="grid gap-2 text-xs sm:grid-cols-[minmax(0,8rem)_1fr]">
        <dt className="font-semibold text-[#4e5c73]">Path:</dt>
        <dd className="font-mono text-[#172033]">{link.endpointPath ?? "Omitted"}</dd>

        <dt className="font-semibold text-[#4e5c73]">Cursor:</dt>
        <dd className="font-mono text-[#172033]">
          {formatCursorDisplay(link.cursor)}
        </dd>

        <dt className="font-semibold text-[#4e5c73]">Order:</dt>
        <dd className="font-mono text-[#172033]">{link.order ?? "Omitted"}</dd>

        <dt className="font-semibold text-[#4e5c73]">Limit:</dt>
        <dd className="font-mono text-[#172033]">{link.limit ?? "Omitted"}</dd>

        <dt className="font-semibold text-[#4e5c73]">URL:</dt>
        <dd className="min-w-0">
          {link.isValidHttp ? (
            <CopyableValue label={copy.copyLink} value={link.href} />
          ) : (
            <div className="space-y-1">
              <span className="block break-all font-mono text-[#68758a]">
                {link.href}
              </span>
              <span className="block text-[11px] text-[#8a98aa]">
                {copy.inertUrlNote}
              </span>
            </div>
          )}
        </dd>
      </dl>
    </li>
  );
}

function RecordRow({ record }: { record: RecordInspection }) {
  return (
    <tr className="border-b border-[#e3ebf5] text-xs">
      <td className="py-2.5 pr-2 font-mono text-[#68758a]">#{record.index}</td>
      <td className="py-2.5 pr-2 font-mono text-[#172033]">
        {record.missingId ? (
          <Badge tone="danger">{copy.badgeMissing}</Badge>
        ) : (
          <CopyableValue label={copy.columnId} value={record.id!} />
        )}
      </td>
      <td className="py-2.5 pr-2 font-mono text-[#172033]">
        {record.missingToken ? (
          <Badge tone="danger">{copy.badgeMissing}</Badge>
        ) : (
          <CopyableValue label={copy.columnPagingToken} value={record.pagingToken!} />
        )}
      </td>
      <td className="py-2.5">
        <div className="flex flex-wrap gap-1">
          {record.duplicateId && (
            <Badge tone="warning">{copy.badgeDuplicate} ID</Badge>
          )}
          {record.duplicateToken && (
            <Badge tone="warning">{copy.badgeDuplicate} Token</Badge>
          )}
          {!record.duplicateId &&
            !record.duplicateToken &&
            !record.missingId &&
            !record.missingToken && (
              <Badge tone="success">{copy.badgeValid}</Badge>
            )}
        </div>
      </td>
    </tr>
  );
}

/** Renders comprehensive diagnostic inspection results for a Horizon collection response. */
export function HorizonPaginationInspectorResult({
  report
}: {
  report: HorizonPaginationReport;
}) {
  const summary = toJsonSummary(report);
  const links = [
    report.selfLink,
    report.nextLink,
    report.prevLink,
    ...report.otherLinks
  ].filter((l): l is ParsedLink => l !== null);

  return (
    <div className="space-y-4">
      {report.hasAnomalies ? (
        <StatusMessage
          type="warning"
          title={copy.anomaliesDetectedTitle}
          description={copy.anomaliesDetectedDescription}
        />
      ) : (
        <StatusMessage
          type="success"
          title={copy.noAnomaliesTitle}
          description={copy.noAnomaliesDescription}
        />
      )}

      {report.hasOffOriginLinks && (
        <StatusMessage
          type="warning"
          title={copy.offOriginTitle}
          description={copy.offOriginDescription}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>{copy.overviewTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.labelRecordCount,
              value: formatRecordCount(report.recordCount),
              mono: true
            },
            {
              label: copy.labelUniqueIds,
              value: String(report.uniqueIdCount),
              mono: true
            },
            {
              label: copy.labelDuplicateIds,
              value: String(report.duplicateIdCount),
              mono: true
            },
            {
              label: copy.labelMissingIds,
              value: String(report.missingIdCount),
              mono: true
            },
            {
              label: copy.labelUniqueTokens,
              value: String(report.uniqueTokenCount),
              mono: true
            },
            {
              label: copy.labelDuplicateTokens,
              value: String(report.duplicateTokenCount),
              mono: true
            },
            {
              label: copy.labelMissingTokens,
              value: String(report.missingTokenCount),
              mono: true
            },
            {
              label: copy.labelExpectedOrigin,
              value: report.expectedOrigin ?? copy.noneProvided
            }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.linksTitle}</CardTitle>
          <CardDescription>{copy.opaqueCursorNote}</CardDescription>
        </CardHeader>
        {links.length > 0 ? (
          <ul className="space-y-3">
            {links.map((link, idx) => (
              <LinkRow key={`${link.rel}-${idx}`} link={link} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#4e5c73]">{copy.noLinks}</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.recordsTitle}</CardTitle>
        </CardHeader>
        {report.records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#cbd5e1] text-[11px] font-bold uppercase tracking-wider text-[#4e5c73]">
                  <th className="pb-2 pr-2">{copy.columnRecordIndex}</th>
                  <th className="pb-2 pr-2">{copy.columnId}</th>
                  <th className="pb-2 pr-2">{copy.columnPagingToken}</th>
                  <th className="pb-2">{copy.columnStatus}</th>
                </tr>
              </thead>
              <tbody>
                {report.records.map((rec) => (
                  <RecordRow key={rec.index} record={rec} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#4e5c73]">{copy.noRecords}</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.pageCautionTitle}</CardTitle>
        </CardHeader>
        <p className="text-xs leading-5 text-[#68758a]">
          {copy.pageCautionDescription}
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.exportTitle}</CardTitle>
          <CardDescription>{copy.exportDescription}</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          <CopyableValue label={copy.copyExport} value={summary} />
          <CodeBlock label="JSON">{summary}</CodeBlock>
        </div>
      </Card>
    </div>
  );
}
