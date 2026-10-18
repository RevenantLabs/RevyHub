import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/xdr-inspector/copy";
import {
  describeTimeBounds,
  formatMemo,
  formatOperationType,
  formatVariant,
  isExpired
} from "@/features/xdr-inspector/lib/format";
import type { EnvelopeSummary } from "@/features/xdr-inspector/types";

export function XdrInspectorResult({ summary }: { summary: EnvelopeSummary }) {
  const { preconditions } = summary;
  const expired = isExpired(preconditions.timeBounds);
  const hasPreconditions =
    preconditions.timeBounds !== null ||
    preconditions.ledgerBounds !== null ||
    preconditions.minSequenceNumber !== null ||
    preconditions.minSequenceLedgerGap !== null ||
    preconditions.extraSignerCount > 0;

  return (
    <div className="space-y-4">
      {expired ? (
        <StatusMessage
          type="warning"
          title={copy.expiredTitle}
          description={copy.expiredDescription}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{copy.summaryTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.labelVariant, value: formatVariant(summary.variant) },
            {
              label: copy.labelSource,
              value: <CopyableValue label="source account" value={summary.sourceAccount} />
            },
            { label: copy.labelSequence, value: summary.sequence, mono: true },
            { label: copy.labelFee, value: `${summary.fee} stroops`, mono: true },
            { label: copy.labelMemo, value: formatMemo(summary.memo) },
            { label: copy.labelSignatures, value: String(summary.signatureCount) }
          ]}
        />
        <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.signatureNote}</p>
      </Card>

      {summary.feeBump ? (
        <Card>
          <CardHeader>
            <CardTitle>{copy.feeBumpTitle}</CardTitle>
            <CardDescription>{copy.feeBumpExplainer}</CardDescription>
          </CardHeader>
          <DataList
            items={[
              {
                label: copy.labelFeeSource,
                value: <CopyableValue label="fee source" value={summary.feeBump.feeSource} />
              },
              { label: copy.labelTotalFee, value: `${summary.feeBump.totalFee} stroops`, mono: true },
              {
                label: copy.labelOuterSignatures,
                value: String(summary.feeBump.outerSignatureCount)
              }
            ]}
          />
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{copy.preconditionsTitle}</CardTitle>
        </CardHeader>

        {hasPreconditions ? (
          <DataList
            items={[
              { label: copy.labelTimeBounds, value: describeTimeBounds(preconditions.timeBounds) },
              {
                label: copy.labelLedgerBounds,
                value: preconditions.ledgerBounds
                  ? `${preconditions.ledgerBounds.minLedger} → ${preconditions.ledgerBounds.maxLedger}`
                  : "None",
                mono: true
              },
              {
                label: copy.labelMinSeqNumber,
                value: preconditions.minSequenceNumber ?? "None",
                mono: true
              },
              {
                label: copy.labelMinSeqAge,
                value: preconditions.minSequenceAge ? `${preconditions.minSequenceAge} seconds` : "None"
              },
              {
                label: copy.labelMinSeqGap,
                value:
                  preconditions.minSequenceLedgerGap === null
                    ? "None"
                    : String(preconditions.minSequenceLedgerGap),
                mono: true
              },
              { label: copy.labelExtraSigners, value: String(preconditions.extraSignerCount) }
            ]}
          />
        ) : (
          <p className="text-sm leading-6 text-[#4e5c73]">{copy.noPreconditions}</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.operationsTitle}</CardTitle>
        </CardHeader>
        <ol className="space-y-2">
          {summary.operationTypes.map((type, index) => (
            <li
              key={`${type}-${index}`}
              className="flex flex-wrap items-center gap-x-3 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm"
            >
              <span className="font-mono text-xs text-[#8a98aa]">#{index + 1}</span>
              <span className="font-semibold text-[#172033]">{formatOperationType(type)}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
