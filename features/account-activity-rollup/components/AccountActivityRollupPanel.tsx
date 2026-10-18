"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy } from "@/features/account-activity-rollup/copy";
import { useAccountActivityRollup } from "@/features/account-activity-rollup/hooks/useAccountActivityRollup";
import { AccountActivityRollupForm } from "@/features/account-activity-rollup/components/AccountActivityRollupForm";
import { AccountActivityRollupEmptyState } from "@/features/account-activity-rollup/components/AccountActivityRollupEmptyState";
import { AccountActivityRollupResult } from "@/features/account-activity-rollup/components/AccountActivityRollupResult";

export function AccountActivityRollupPanel() {
  const { state, submit, loadMore } = useAccountActivityRollup();
  return <div className="space-y-5">
    <Card><AccountActivityRollupForm onSubmit={submit} pending={state.status === "loading"} error={state.status === "error" ? state.code : null} /></Card>
    {state.status === "idle" ? <AccountActivityRollupEmptyState /> : null}
    {state.status === "loading" ? <Card><p role="status" className="sr-only">{copy.loading}</p><SkeletonRows rows={3} /></Card> : null}
    {state.status === "error" && state.code !== "invalid_account" ? <StatusMessage type="error" title={errorCopy[state.code].title} description={errorCopy[state.code].description} /> : null}
    {state.status === "success" ? <>
      <AccountActivityRollupResult result={state.result} paging={state.paging} onLoadMore={loadMore} />
      {state.pageError ? <StatusMessage type="error" title={errorCopy[state.pageError].title} description={errorCopy[state.pageError].description} /> : null}
    </> : null}
  </div>;
}
