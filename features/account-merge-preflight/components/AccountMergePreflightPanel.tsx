"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAccountMergePreflight } from "@/features/account-merge-preflight/hooks/useAccountMergePreflight";
import { errorCopy } from "@/features/account-merge-preflight/copy";
import { AccountMergePreflightForm } from "@/features/account-merge-preflight/components/AccountMergePreflightForm";
import { AccountMergePreflightResult } from "@/features/account-merge-preflight/components/AccountMergePreflightResult";
import { AccountMergePreflightEmptyState } from "@/features/account-merge-preflight/components/AccountMergePreflightEmptyState";

export function AccountMergePreflightPanel() {
  const { state, submit } = useAccountMergePreflight();

  return (
    <div className="space-y-5">
      <Card>
        <AccountMergePreflightForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <AccountMergePreflightResult result={state.result} /> : null}

      {state.status === "idle" ? <AccountMergePreflightEmptyState /> : null}
    </div>
  );
}
