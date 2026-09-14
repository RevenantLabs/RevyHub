"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useClaimablePredicateBuilder } from "@/features/claimable-predicate-builder/hooks/useClaimablePredicateBuilder";
import { errorCopy } from "@/features/claimable-predicate-builder/copy";
import { ClaimablePredicateBuilderForm } from "@/features/claimable-predicate-builder/components/ClaimablePredicateBuilderForm";
import { ClaimablePredicateBuilderResult } from "@/features/claimable-predicate-builder/components/ClaimablePredicateBuilderResult";
import { ClaimablePredicateBuilderEmptyState } from "@/features/claimable-predicate-builder/components/ClaimablePredicateBuilderEmptyState";

export function ClaimablePredicateBuilderPanel() {
  const { state, submit } = useClaimablePredicateBuilder();

  return (
    <div className="space-y-5">
      <Card>
        <ClaimablePredicateBuilderForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <ClaimablePredicateBuilderResult result={state.result} /> : null}

      {state.status === "idle" ? <ClaimablePredicateBuilderEmptyState /> : null}
    </div>
  );
}
