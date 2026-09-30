import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/horizon-pagination-inspector/copy";
import {
  formatCursor,
  formatDuplicates,
  formatIndexes,
  formatRecordCount,
  formatTokenOrder,
  hasNextPageEvidence,
  isConclusiveAboutEnd
} from "@/features/horizon-pagination-inspector/lib/format";
import type { PaginationInspection } from "@/features/horizon-pagination-inspector/types";

export function HorizonPaginationInspectorResult({
  inspection
}: {
  inspection: PaginationInspection;
}) {
  const hasNext = hasNextPageEvidence(inspection);
  const conclusive = isConclusiveAboutEnd(inspection);

  return (
    <div className="space-y-4">
      {!inspection.hasLinksObject ? (
        <StatusMessage
          type="info"
          title={copy.linksObjectAbsentTitle}
          description={copy.linksObjectAbsent}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{copy.summaryTitle}</CardTitle>
          <CardDescription>{copy.shortPageNote}</CardDescription>
        </CardHeader>
        <DataList
          items={[
            { label: copy.labelRecordCount, value: formatRecordCount(inspection.recordCount) },
            { label: copy.labelTokenOrder, value: formatTokenOrder(inspection.tokenOrder) },
            {
              label: copy.labelNext,
              value: hasNext ? "Present — more pages may follow" : "Absent from this response"
            },
            {
              label: "Reaches the end?",
              value: conclusive
                ? "This response is the last one it describes"
                : "Not established by this response"
            }
          ]}
        />
        <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.orderNote}</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.linksTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.labelNext,
              value: inspection.next ? (
                <CopyableValue label="next link" value={inspection.next.href} />
              ) : (
                copy.linkAbsent
              ),
              mono: true
            },
            {
              label: copy.labelCursor,
              value: inspection.next ? (
                <CopyableValue
                  label="next cursor"
                  value={formatCursor(inspection.next, copy.linkAbsent)}
                />
              ) : (
                copy.linkAbsent
              ),
              mono: true
            },
            {
              label: copy.labelPrev,
              value: inspection.prev ? (
                <CopyableValue label="previous link" value={inspection.prev.href} />
              ) : (
                copy.linkAbsent
              ),
              mono: true
            }
          ]}
        />
        <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.cursorNote}</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.identifiersTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.labelDuplicates,
              value:
                inspection.duplicates.length > 0
                  ? formatDuplicates(inspection.duplicates)
                  : copy.noneDetected,
              mono: inspection.duplicates.length > 0
            },
            {
              label: copy.labelMissing,
              value:
                inspection.missingIdentifiers.length > 0
                  ? formatIndexes(inspection.missingIdentifiers)
                  : copy.noneDetected,
              mono: inspection.missingIdentifiers.length > 0
            },
            {
              label: copy.labelNonNumeric,
              value:
                inspection.nonNumericTokens.length > 0
                  ? formatIndexes(inspection.nonNumericTokens)
                  : copy.noneDetected,
              mono: inspection.nonNumericTokens.length > 0
            }
          ]}
        />
        {inspection.duplicates.length > 0 ? (
          <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.duplicateNote}</p>
        ) : null}
        {inspection.missingIdentifiers.length > 0 ? (
          <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.missingNote}</p>
        ) : null}
      </Card>
    </div>
  );
}
