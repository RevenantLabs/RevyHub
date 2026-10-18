import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { Button } from "@/core/ui/Button";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/sequence-inspector/copy";
import {
  formatBitPart,
  formatIncrease,
  formatSequence
} from "@/features/sequence-inspector/lib/format";
import type { SequenceInspectorResult as SequenceInspectorResultValue } from "@/features/sequence-inspector/types";

export function SequenceInspectorResult({
  result,
  onReset
}: {
  result: SequenceInspectorResultValue;
  onReset: () => void;
}) {
  const current = formatSequence(result.currentSequence);
  const next = result.nextSequence === null ? null : formatSequence(result.nextSequence);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.account,
              value: <CopyableValue label={copy.account.toLowerCase()} value={result.accountId} />
            },
            {
              label: copy.currentSequence,
              value: <CopyableValue label={copy.copyCurrent} value={current} full />
            },
            {
              label: copy.nextSequence,
              value: next ? (
                <CopyableValue label={copy.copyNext} value={next} full />
              ) : copy.noNextSequence
            },
            { label: copy.creationLedger, value: formatBitPart(result.creationLedger), mono: true },
            { label: copy.offset, value: formatBitPart(result.offset), mono: true },
            {
              label: copy.creationLedgerMaximum,
              value: formatSequence(result.creationLedgerMaximum),
              mono: true
            },
            {
              label: copy.sequenceUpdatedLedger,
              value: formatSequence(result.sequenceUpdatedLedger),
              mono: true
            }
          ]}
        />
      </Card>

      <StatusMessage
        type="info"
        title={copy.structureTitle}
        description={`${copy.structureDescription} ${copy.horizonLedgerNote}`}
      />

      {result.bumpTarget !== undefined && result.bumpIncrease !== undefined ? (
        <Card>
          <CardHeader>
            <CardTitle>{copy.bumpTitle}</CardTitle>
          </CardHeader>
          <DataList
            items={[
              {
                label: copy.bumpTarget,
                value: (
                  <CopyableValue
                    label={copy.copyBump}
                    value={formatSequence(result.bumpTarget)}
                    full
                  />
                )
              },
              { label: copy.bumpIncrease, value: formatIncrease(result.bumpIncrease), mono: true }
            ]}
          />
          <p className="mt-4 text-sm leading-6 text-[#68758a]">{copy.bumpDescription}</p>
          {result.bumpChangesLedgerPrefix ? (
            <p className="mt-2 text-sm font-semibold leading-6 text-[#9a513f]">
              {copy.bumpPrefixWarning}
            </p>
          ) : null}
        </Card>
      ) : null}

      <StatusMessage
        type={next ? "info" : "warning"}
        title={copy.txBadSeqTitle}
        description={next ? copy.txBadSeqDescription : copy.exhaustedDescription}
      />

      <Button type="button" variant="secondary" onClick={onReset}>
        {copy.reset}
      </Button>
    </div>
  );
}
