import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy } from "../copy";
import { formatLedger } from "../lib/format";
import type { AuditResult, ExpiryStatus } from "../types";

export function AuthExpirySummary({ result }: { result: AuditResult }) {
  const counts: Record<ExpiryStatus, number> = { ready: 0, expired: 0, unknown: 0 };
  result.rows.forEach((row) => counts[row.expiry]++);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.expiryTitle}</CardTitle>
      </CardHeader>
      <dl className="grid gap-2 sm:grid-cols-2">
        <dt>{copy.network}</dt>
        <dd className="break-all font-mono text-xs">{result.networkPassphrase}</dd>
        <dt>{copy.ledger}</dt>
        <dd>{formatLedger(result.evaluationLedger)}</dd>
        <dt>{copy.ready}</dt>
        <dd>{counts.ready}</dd>
        <dt>{copy.expired}</dt>
        <dd>{counts.expired}</dd>
        <dt>{copy.unknown}</dt>
        <dd>{counts.unknown}</dd>
      </dl>
    </Card>
  );
}
