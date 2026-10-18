"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useClaimableBalances } from "@/features/claimable-balances/hooks/useClaimableBalances";
import { copy, errorCopy } from "@/features/claimable-balances/copy";
import { ClaimableBalancesForm } from "@/features/claimable-balances/components/ClaimableBalancesForm";
import { ClaimableBalancesResult } from "@/features/claimable-balances/components/ClaimableBalancesResult";
import { ClaimableBalancesEmptyState } from "@/features/claimable-balances/components/ClaimableBalancesEmptyState";

export function ClaimableBalancesPanel() {
  const { state, submit } = useClaimableBalances();
  const fieldError = state.status === "error" ? state : null;

  return (
    <div className="space-y-5">
      <Card>
        <ClaimableBalancesForm
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

      {state.status === "success" ? <ClaimableBalancesResult result={state.result} /> : null}

      {state.status === "idle" ? <ClaimableBalancesEmptyState /> : null}
    </div>
  );
}
