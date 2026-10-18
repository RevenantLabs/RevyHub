import { Card } from "@/core/ui/Card";
import { copy } from "../copy";
import type { DeadlineBoardResult } from "../types";
import { DeadlineRows } from "./DeadlineRows";
import { UndatedBalances } from "./UndatedBalances";
export function ClaimableBalanceDeadlineBoardResult({ result }: { result: DeadlineBoardResult }) {
  const rows = [...result.dated, ...result.undated];
  return <div className="space-y-4"><Card><h2 className="text-lg font-bold">{copy.resultTitle}</h2><p>{copy.pages(result.pagesFetched)}</p>
    {result.limitReached && <p>{copy.bounded}</p>}
    {rows.length === 0 ? <p>{copy.noBalances}</p> : <p><strong>{copy.nextCursor}:</strong> <span className="break-all font-mono">{result.nextCursor}</span></p>}
  </Card><DeadlineRows rows={result.dated} /><UndatedBalances rows={result.undated} /></div>;
}
