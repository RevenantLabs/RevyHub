"use client";
import { Button } from "@/core/ui/Button";
import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy } from "@/features/claimable-predicate-evaluator/copy";
import { useClaimablePredicateEvaluator } from "@/features/claimable-predicate-evaluator/hooks/useClaimablePredicateEvaluator";
import { ClaimablePredicateEvaluatorForm } from "@/features/claimable-predicate-evaluator/components/ClaimablePredicateEvaluatorForm";
import { ClaimablePredicateEvaluatorResult } from "@/features/claimable-predicate-evaluator/components/ClaimablePredicateEvaluatorResult";
import { ClaimablePredicateEvaluatorEmptyState } from "@/features/claimable-predicate-evaluator/components/ClaimablePredicateEvaluatorEmptyState";
export function ClaimablePredicateEvaluatorPanel() {
  const { state, submit, reset, redactions } = useClaimablePredicateEvaluator();
  return <div className="space-y-5"><Card><ClaimablePredicateEvaluatorForm key={redactions} onSubmit={submit} pending={state.status === "loading"} /></Card>
    {state.status === "loading" ? <StatusMessage type="info" title={copy.processing} /> : null}
    {state.status === "error" ? <StatusMessage type="error" title={errorCopy[state.code].title} description={errorCopy[state.code].description} /> : null}
    {state.status === "success" || state.status === "incomplete" ? <ClaimablePredicateEvaluatorResult result={state.result} /> : null}
    {state.status === "idle" ? <ClaimablePredicateEvaluatorEmptyState /> : null}
    {state.status !== "idle" ? <Button type="button" onClick={reset}>{copy.reset}</Button> : null}
  </div>;
}
