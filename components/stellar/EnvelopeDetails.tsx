import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import type {
  EnvelopeVariant,
  PreconditionsSummary,
  TransactionEnvelopeSummary
} from "@/lib/stellar/xdrInspector";
import { formatStroopAmount } from "@/lib/stellar/stroops";

const variantLabels: Record<EnvelopeVariant, string> = {
  "classic-v0": "Classic (v0)",
  "classic-v1": "Classic (v1)",
  "fee-bump": "Fee bump"
};

export function formatFee(stroops: string) {
  const amount = formatStroopAmount(stroops);

  if (!amount) {
    return `${stroops} stroops`;
  }

  return `${amount.stroops} stroops (${amount.xlm} XLM)`;
}

function formatTimePoint(value: string) {
  if (value === "0") {
    return "unbounded";
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return value;
  }

  return `${new Date(parsed * 1000).toLocaleString()} (${value})`;
}

function formatOperationType(name: string) {
  const spaced = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatMemo(memo: TransactionEnvelopeSummary["memo"]) {
  if (memo.type === "none") {
    return "None";
  }

  return `${memo.type.toUpperCase()}: ${memo.value ?? ""}`;
}

function preconditionLines(preconditions: PreconditionsSummary) {
  const lines: string[] = [];

  if (preconditions.timeBounds) {
    lines.push(
      `Valid from ${formatTimePoint(preconditions.timeBounds.minTime)} until ${formatTimePoint(preconditions.timeBounds.maxTime)}`
    );
  }

  if (preconditions.ledgerBounds) {
    const { minLedger, maxLedger } = preconditions.ledgerBounds;
    lines.push(`Ledger bounds: ${minLedger} to ${maxLedger === 0 ? "unbounded" : maxLedger}`);
  }

  if (preconditions.minSequenceNumber) {
    lines.push(`Minimum source sequence: ${preconditions.minSequenceNumber}`);
  }

  if (preconditions.minSequenceAge && preconditions.minSequenceAge !== "0") {
    lines.push(`Minimum sequence age: ${preconditions.minSequenceAge} seconds`);
  }

  if (preconditions.minSequenceLedgerGap) {
    lines.push(`Minimum sequence ledger gap: ${preconditions.minSequenceLedgerGap}`);
  }

  if (preconditions.extraSignerCount) {
    lines.push(`Extra signers required: ${preconditions.extraSignerCount}`);
  }

  return lines.length ? lines : ["None"];
}

export function EnvelopeDetails({ summary }: { summary: TransactionEnvelopeSummary }) {
  const preconditions = preconditionLines(summary.preconditions);
  const rows = [
    ["Envelope type", variantLabels[summary.variant]],
    ["Source account", <CopyableValue key="source" label="source account" value={summary.sourceAccount} />],
    ["Sequence", summary.sequence],
    [summary.feeBump ? "Inner fee" : "Fee", formatFee(summary.fee)],
    ["Memo", formatMemo(summary.memo)],
    [
      "Preconditions",
      <span key="preconditions" className="block space-y-1">
        {preconditions.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </span>
    ],
    [
      "Operations",
      <span key="operations" className="flex flex-wrap items-center gap-2">
        <Badge tone="info">{summary.operationTypes.length} total</Badge>
        {summary.operationTypes.map((type, index) => (
          <Badge key={`${type}-${index}`}>{formatOperationType(type)}</Badge>
        ))}
      </span>
    ],
    [
      summary.feeBump ? "Inner signatures" : "Signatures",
      `${summary.signatureCount} ${summary.signatureCount === 1 ? "signature" : "signatures"} attached`
    ]
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#172033]">Envelope contents</p>
        <Badge tone={summary.signatureCount > 0 ? "success" : "warning"}>
          {summary.signatureCount > 0 ? "Signed" : "Unsigned"}
        </Badge>
      </div>
      {summary.feeBump ? (
        <dl className="divide-y divide-[#c7d6e8] rounded-lg border border-[#c7b9f3]/70 bg-[#f1edff]/70">
          {(
            [
              ["Fee source", <CopyableValue key="fee-source" label="fee source account" value={summary.feeBump.feeSource} />],
              ["Total fee", formatFee(summary.feeBump.totalFee)],
              [
                "Outer signatures",
                `${summary.feeBump.outerSignatureCount} ${summary.feeBump.outerSignatureCount === 1 ? "signature" : "signatures"} attached`
              ]
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
              <dt className="text-xs uppercase tracking-wide text-[#68758a]">{label}</dt>
              <dd className="break-words text-sm text-[#29364d] sm:col-span-2">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <dl className="divide-y divide-[#c7d6e8] rounded-lg border border-white/80 bg-white/68">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
            <dt className="text-xs uppercase tracking-wide text-[#68758a]">{label}</dt>
            <dd className="break-words text-sm text-[#29364d] sm:col-span-2">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
