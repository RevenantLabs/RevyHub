import { Card } from "@/core/ui/Card";
import { copy } from "../copy";
import { formatBalanceAmount, formatBalanceAsset, formatDeadline } from "../lib/format";
import type { DeadlineRow } from "../types";
import { PredicateDetails } from "./PredicateDetails";
export function DeadlineRows({ rows }: { rows: DeadlineRow[] }) {
  if (!rows.length) return null;
  return <section aria-label={copy.datedTitle} className="space-y-3"><h3 className="font-bold">{copy.datedTitle}</h3>{rows.map((row) => <Card key={row.id}><div className="space-y-2 text-sm">
    <p><strong>{copy.balanceId}:</strong> <span className="break-all font-mono">{row.id}</span></p>
    <p><strong>{copy.amount}:</strong> {formatBalanceAmount(row.amount)} {formatBalanceAsset(row.asset)}</p>
    <p><strong>{copy.deadline} ({row.deadlineKind === "relative" ? copy.relative : copy.absolute}):</strong> {formatDeadline(row.deadline!)}</p>
    <p>{row.conditionPassed ? copy.conditionPassed : copy.conditionUpcoming}</p>
    <div><strong>{copy.predicate}:</strong> <PredicateDetails node={row.predicate} /></div>
  </div></Card>)}</section>;
}
