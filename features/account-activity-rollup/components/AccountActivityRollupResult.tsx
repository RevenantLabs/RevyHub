import { Button } from "@/core/ui/Button";
import { Badge } from "@/core/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { EmptyState } from "@/core/ui/EmptyState";
import { History } from "lucide-react";
import { copy } from "@/features/account-activity-rollup/copy";
import { TypeBreakdown } from "@/features/account-activity-rollup/components/TypeBreakdown";
import { DailyActivity } from "@/features/account-activity-rollup/components/DailyActivity";
import { CoverageNotice } from "@/features/account-activity-rollup/components/CoverageNotice";
import type { AccountActivityRollupResult as Result } from "@/features/account-activity-rollup/types";

export function AccountActivityRollupResult({ result, paging, onLoadMore }: { result: Result; paging: boolean; onLoadMore: () => void }) {
  return <section className="space-y-4" aria-label={copy.resultTitle}>
    <Card><CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
      <div className="flex flex-wrap items-center gap-2"><span>{copy.networkLabel}</span><Badge tone="info">{result.network}</Badge></div>
      <p className="break-all text-sm">{result.accountId}</p>
    </Card>
    <CoverageNotice coverage={result.coverage} />
    {result.operations.length ? <><TypeBreakdown groups={result.byType} /><DailyActivity groups={result.byDay} /></> :
      <EmptyState icon={History} title={copy.noActivityTitle} description={copy.noActivityDescription} />}
    {result.cursor ? <Button type="button" onClick={onLoadMore} disabled={paging}>{paging ? copy.loadingPage : copy.loadMore}</Button> : null}
  </section>;
}
