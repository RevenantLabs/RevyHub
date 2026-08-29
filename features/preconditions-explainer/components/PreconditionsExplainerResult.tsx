import { Badge } from "@/core/ui/Badge";
import { Button } from "@/core/ui/Button";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import {
  boundStatusCopy,
  copy,
  errorCopy,
  signerKindCopy,
  variantCopy,
  verdictCopy
} from "@/features/preconditions-explainer/copy";
import {
  boundStatusTone,
  formatIsoTimestamp,
  formatLedgerBound,
  formatLedgerBoundAt,
  formatTimeBound,
  verdictTone
} from "@/features/preconditions-explainer/lib/format";
import type { PreconditionsExplanation } from "@/features/preconditions-explainer/types";

export function PreconditionsExplainerResult({
  explanation,
  onReset
}: {
  explanation: PreconditionsExplanation;
  onReset: () => void;
}) {
  const { timeBounds, ledgerBounds, ledger, degradedReason } = explanation;

  return (
    <div className="space-y-4">
      <StatusMessage
        type={verdictTone(explanation.verdict)}
        title={verdictCopy[explanation.verdict].title}
        description={verdictCopy[explanation.verdict].description}
      />

      {degradedReason ? (
        <StatusMessage
          type="warning"
          title={copy.degradedTitle}
          description={`${copy.degradedDescription} ${errorCopy[degradedReason].description}`}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{copy.transactionTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.labelVariant, value: variantCopy[explanation.variant] },
            {
              label: copy.labelSource,
              value: <CopyableValue label="source account" value={explanation.sourceAccount} />
            },
            { label: copy.labelSequence, value: explanation.sequenceNumber, mono: true }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.snapshotTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.labelCurrentLedger,
              value: ledger ? formatLedgerBound(ledger.sequence) : boundStatusCopy.unknown,
              mono: true
            },
            {
              label: copy.labelLedgerClosedAt,
              value: ledger ? formatIsoTimestamp(ledger.closedAt) : boundStatusCopy.unknown
            },
            { label: copy.labelEvaluatedAt, value: formatIsoTimestamp(explanation.evaluatedAt) },
            {
              label: copy.labelClock,
              value:
                explanation.clockSource === "ledger-close-time"
                  ? copy.clockLedger
                  : copy.clockLocal
            }
          ]}
        />
        <p className="mt-4 text-sm leading-6 text-[#68758a]">{copy.snapshotNote}</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.timeBoundsTitle}</CardTitle>
        </CardHeader>

        {timeBounds ? (
          <>
            <p className="mb-3">
              <Badge tone={boundStatusTone(timeBounds.status)}>
                {boundStatusCopy[timeBounds.status]}
              </Badge>
            </p>
            <DataList
              items={[
                {
                  label: copy.labelValidFrom,
                  value: formatTimeBound(timeBounds.minTime, timeBounds.minTimeDeltaSeconds)
                },
                {
                  label: copy.labelValidUntil,
                  value: formatTimeBound(timeBounds.maxTime, timeBounds.maxTimeDeltaSeconds)
                }
              ]}
            />
            <p className="mt-4 text-sm leading-6 text-[#68758a]">{copy.timeBoundsNote}</p>
          </>
        ) : (
          <p className="text-sm leading-6 text-[#68758a]">{copy.noTimeBounds}</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.ledgerBoundsTitle}</CardTitle>
        </CardHeader>

        {ledgerBounds ? (
          <>
            <p className="mb-3">
              <Badge tone={boundStatusTone(ledgerBounds.status)}>
                {boundStatusCopy[ledgerBounds.status]}
              </Badge>
            </p>
            <DataList
              items={[
                {
                  label: copy.labelMinLedger,
                  value: formatLedgerBoundAt(ledgerBounds.minLedger, ledgerBounds.ledgersUntilMin),
                  mono: true
                },
                {
                  label: copy.labelMaxLedger,
                  value: formatLedgerBoundAt(ledgerBounds.maxLedger, ledgerBounds.ledgersUntilMax),
                  mono: true
                }
              ]}
            />
            {ledgerBounds.status === "unknown" ? (
              <p className="mt-4 text-sm leading-6 text-[#68758a]">{copy.ledgerBoundsUnknown}</p>
            ) : null}
            <p className="mt-4 text-sm leading-6 text-[#68758a]">{copy.ledgerBoundsNote}</p>
          </>
        ) : (
          <p className="text-sm leading-6 text-[#68758a]">{copy.noLedgerBounds}</p>
        )}
      </Card>

      {explanation.accountDependent ? (
        <Card>
          <CardHeader>
            <CardTitle>{copy.sequenceRulesTitle}</CardTitle>
          </CardHeader>
          <p className="mb-3">
            <Badge tone="info">{copy.accountDependentBadge}</Badge>
          </p>

          <dl className="space-y-4">
            {explanation.minSequenceNumber !== null ? (
              <SequenceRule
                label={copy.labelMinSequenceNumber}
                value={explanation.minSequenceNumber}
                gate={copy.minSequenceNumberGate}
              />
            ) : null}
            {explanation.minSequenceAge !== null ? (
              <SequenceRule
                label={copy.labelMinSequenceAge}
                value={`${explanation.minSequenceAge} seconds`}
                gate={copy.minSequenceAgeGate}
              />
            ) : null}
            {explanation.minSequenceLedgerGap !== null ? (
              <SequenceRule
                label={copy.labelMinSequenceLedgerGap}
                value={`${explanation.minSequenceLedgerGap} ledgers`}
                gate={copy.minSequenceLedgerGapGate}
              />
            ) : null}
          </dl>

          <p className="mt-4 text-sm leading-6 text-[#68758a]">{copy.sequenceRulesNote}</p>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{copy.extraSignersTitle}</CardTitle>
        </CardHeader>

        {explanation.extraSigners.length ? (
          <>
            <ol className="space-y-2">
              {explanation.extraSigners.map((signer, index) => (
                <li
                  key={signer.key}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm"
                >
                  <span className="font-mono text-xs text-[#8a98aa]">#{index + 1}</span>
                  <span className="font-semibold text-[#172033]">
                    {signerKindCopy[signer.kind]}
                  </span>
                  <CopyableValue label={`extra signer ${index + 1}`} value={signer.key} />
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm leading-6 text-[#68758a]">{copy.extraSignersNote}</p>
          </>
        ) : (
          <p className="text-sm leading-6 text-[#68758a]">{copy.noExtraSigners}</p>
        )}
      </Card>

      <Button type="button" variant="secondary" onClick={onReset}>
        {copy.reset}
      </Button>
    </div>
  );
}

function SequenceRule({ label, value, gate }: { label: string; value: string; gate: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm font-bold text-[#4e5c73]">{label}</dt>
      <dd className="space-y-1">
        <p className="font-mono text-xs text-[#172033]">{value}</p>
        <p className="text-sm leading-6 text-[#68758a]">{gate}</p>
      </dd>
    </div>
  );
}
