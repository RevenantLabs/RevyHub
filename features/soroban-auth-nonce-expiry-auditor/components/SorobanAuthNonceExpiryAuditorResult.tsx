import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "../copy";
import { formatIdentity, formatLedger, formatNonce } from "../lib/format";
import type { AuditResult, AuditRow } from "../types";
import { AuthExpirySummary } from "./AuthExpirySummary";
import { NonceReuseRows } from "./NonceReuseRows";

function payloadLabel(row: AuditRow): string {
  if (row.signaturePayloadPresent === null) return copy.unavailable;
  return row.signaturePayloadPresent ? copy.present : copy.absent;
}

export function SorobanAuthNonceExpiryAuditorResult({ result }: { result: AuditResult }) {
  return (
    <div className="space-y-4">
      {result.incompleteEvidence ? (
        <StatusMessage type="warning" title={copy.incompleteTitle} description={copy.incompleteDescription} />
      ) : null}
      <AuthExpirySummary result={result} />
      <NonceReuseRows groups={result.reuse} />
      <Card>
        <CardHeader>
          <CardTitle>{copy.rowsTitle}</CardTitle>
        </CardHeader>
        <ol className="space-y-3">
          {result.rows.map((row) => (
            <li key={row.index} className="rounded border p-3 text-sm">
              <p className="font-bold">
                {copy.index} {row.index}: {copy.credentialLabels[row.credential]}
              </p>
              <dl className="grid gap-1 sm:grid-cols-[12rem_1fr]">
                <dt>{copy.identity}</dt>
                <dd className="break-all font-mono text-xs">{formatIdentity(row)}</dd>
                <dt>{copy.nonce}</dt>
                <dd className="break-all font-mono">{formatNonce(row.nonce)}</dd>
                <dt>{copy.expiration}</dt>
                <dd>{formatLedger(row.expirationLedger)}</dd>
                <dt>{copy.status}</dt>
                <dd>{copy[row.expiry]}</dd>
                <dt>{copy.payload}</dt>
                <dd>{payloadLabel(row)}</dd>
              </dl>
            </li>
          ))}
        </ol>
      </Card>
      <p className="text-sm text-[#4e5c73]">{copy.sourceNote}</p>
      <p className="text-sm text-[#4e5c73]">{copy.limitation}</p>
      {result.rows.some((row) => row.credential === "source-account") ? (
        <p className="text-sm text-[#4e5c73]">{copy.sourceAccount}</p>
      ) : null}
    </div>
  );
}
