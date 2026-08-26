"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAccountMergePreflight } from "@/features/account-merge-preflight/hooks/useAccountMergePreflight";
import { copy, errorCopy } from "@/features/account-merge-preflight/copy";
import { AccountMergePreflightForm } from "@/features/account-merge-preflight/components/AccountMergePreflightForm";
import { AccountMergePreflightResult } from "@/features/account-merge-preflight/components/AccountMergePreflightResult";
import { AccountMergePreflightEmptyState } from "@/features/account-merge-preflight/components/AccountMergePreflightEmptyState";

export function AccountMergePreflightPanel() {
  const { state, submit, reset } = useAccountMergePreflight();
  const field = state.status === "error" ? state.field : null;
  const fieldError =
    state.status === "error" && state.field
      ? `${errorCopy[state.code].title}. ${errorCopy[state.code].description}`
      : undefined;

  return (
    <div className="space-y-5">
      <Card>
        <AccountMergePreflightForm
          onSubmit={submit}
          pending={state.status === "loading"}
          field={field}
          fieldError={fieldError}
        />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">{copy.loading}</p>
          <SkeletonRows rows={7} />
        </Card>
      ) : null}

      {state.status === "error" && state.field === null ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <AccountMergePreflightResult result={state.result} onReset={reset} />
      ) : null}

      {state.status === "idle" ? <AccountMergePreflightEmptyState /> : null}
    </div>
  );
}
