"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useClaimableBalanceReadiness } from "@/features/claimable-balance-readiness/hooks/useClaimableBalanceReadiness";
import { copy, errorCopy } from "@/features/claimable-balance-readiness/copy";
import { ClaimableBalanceReadinessForm } from "@/features/claimable-balance-readiness/components/ClaimableBalanceReadinessForm";
import { ClaimableBalanceReadinessResult } from "@/features/claimable-balance-readiness/components/ClaimableBalanceReadinessResult";
import { ClaimableBalanceReadinessEmptyState } from "@/features/claimable-balance-readiness/components/ClaimableBalanceReadinessEmptyState";

export function ClaimableBalanceReadinessPanel() {
  const { state, submit } = useClaimableBalanceReadiness();
  const fieldError = state.status === "error" ? state : null;

  return (
    <div className="space-y-5">
      <Card>
        <ClaimableBalanceReadinessForm
          onSubmit={submit}
          pending={state.status === "loading"}
          errorField={fieldError?.field ?? null}
          errorMessage={fieldError ? errorCopy[fieldError.code].title : null}
        />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}

      {state.status === "error" && !state.field ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <ClaimableBalanceReadinessResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <ClaimableBalanceReadinessEmptyState /> : null}
    </div>
  );
}
