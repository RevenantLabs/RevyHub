import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import type { DecodedEnvelope } from "@/lib/stellar/transaction";

function formatFee(stroops: string) {
  const fee = Number(stroops);

  if (!Number.isFinite(fee)) {
    return `${stroops} stroops`;
  }

  return `${fee} stroops (${(fee / 10_000_000).toFixed(7)} XLM)`;
}

function formatTimestamp(unixTime: string) {
  const timestamp = Number(unixTime);
  
  if (timestamp === 0) {
    return "0 (no bound)";
  }

  if (!Number.isFinite(timestamp)) {
    return unixTime;
  }

  return `${timestamp} (${new Date(timestamp * 1000).toLocaleString()})`;
}

export function EnvelopeDetails({ envelope }: { envelope: DecodedEnvelope }) {
  const rows = [
    ["Envelope type", envelope.envelopeType.replace("ENVELOPE_TYPE_", "")],
    ["Source account", <CopyableValue key="source" label="source account" value={envelope.sourceAccount} />],
    ["Sequence number", envelope.sequence],
    ["Fee", formatFee(envelope.fee)],
    ["Memo type", envelope.memoType],
    ["Memo", envelope.memo],
    ["Signatures", String(envelope.signatureCount)],
    ["Operations", String(envelope.operations.length)],
  ] as const;

  // Add time bounds if present
  const timeRows = envelope.timeBounds
    ? [
        ["Min time", formatTimestamp(envelope.timeBounds.minTime)],
        ["Max time", formatTimestamp(envelope.timeBounds.maxTime)],
      ]
    : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#172033]">Decoded envelope</p>
        <Badge tone={envelope.signatureCount > 0 ? "success" : "warning"}>
          {envelope.signatureCount > 0 ? "Signed" : "Unsigned"}
        </Badge>
      </div>
      <dl className="divide-y divide-[#c7d6e8] rounded-lg border border-white/80 bg-white/68">
        {[...rows, ...timeRows].map(([label, value]) => (
          <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
            <dt className="text-xs uppercase tracking-wide text-[#68758a]">{label}</dt>
            <dd className="break-words text-sm text-[#29364d] sm:col-span-2">{value}</dd>
          </div>
        ))}
      </dl>

      {envelope.operations.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#172033]">Operations</p>
          <div className="space-y-2">
            {envelope.operations.map((op, index) => (
              <div key={index} className="rounded-lg border border-white/80 bg-white/68 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#172033]">
                      {index + 1}. {op.type}
                    </p>
                    {op.sourceAccount && (
                      <p className="mt-1 break-all text-xs text-[#68758a]">
                        Source: {op.sourceAccount}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {envelope.networkPassphrase && (
        <div className="rounded-lg border border-[#ffd1c6]/80 bg-[#fff7f1]/75 p-3">
          <p className="text-xs font-medium text-[#9a6754]">Network passphrase note</p>
          <p className="mt-1 text-sm text-[#4e5c73]">{envelope.networkPassphrase}</p>
        </div>
      )}

      <div className="rounded-lg border border-[#ffd1c6]/80 bg-[#fff7f1]/75 p-3">
        <p className="text-xs font-medium text-[#9a6754]">Security notice</p>
        <p className="mt-1 text-sm text-[#4e5c73]">
          This XDR was decoded locally in your browser. It was not logged, persisted, or submitted to any network.
          Always verify transaction details before signing or submitting.
        </p>
      </div>
    </div>
  );
}
