"use client";
import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useClaimableBalanceDeadlineBoard } from "../hooks/useClaimableBalanceDeadlineBoard";
import { copy, errorCopy } from "../copy";
import { ClaimableBalanceDeadlineBoardForm } from "./ClaimableBalanceDeadlineBoardForm";
import { ClaimableBalanceDeadlineBoardResult } from "./ClaimableBalanceDeadlineBoardResult";
import { ClaimableBalanceDeadlineBoardEmptyState } from "./ClaimableBalanceDeadlineBoardEmptyState";
export function ClaimableBalanceDeadlineBoardPanel() {
  const { state, submit } = useClaimableBalanceDeadlineBoard();
  const error = state.status === "error" ? state : null;
  return <div className="space-y-5"><Card><ClaimableBalanceDeadlineBoardForm onSubmit={submit} pending={state.status === "loading"} errorField={error?.field ?? null} errorMessage={error ? errorCopy[error.code].description : null} /></Card>
    {state.status === "loading" && <Card><p role="status" className="sr-only">{copy.loading}</p><SkeletonRows rows={3} /></Card>}
    {error && !error.field && <StatusMessage type="error" title={errorCopy[error.code].title} description={errorCopy[error.code].description} />}
    {state.status === "success" && <ClaimableBalanceDeadlineBoardResult result={state.result} />}
    {state.status === "idle" && <ClaimableBalanceDeadlineBoardEmptyState />}
  </div>;
}
