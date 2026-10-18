"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAccountDataEntries } from "@/features/account-data-entries/hooks/useAccountDataEntries";
import { copy, errorCopy } from "@/features/account-data-entries/copy";
import { AccountDataEntriesForm } from "@/features/account-data-entries/components/AccountDataEntriesForm";
import { AccountDataEntriesResult } from "@/features/account-data-entries/components/AccountDataEntriesResult";
import { AccountDataEntriesEmptyState } from "@/features/account-data-entries/components/AccountDataEntriesEmptyState";

export function AccountDataEntriesPanel() {
  const { state, submit } = useAccountDataEntries();

  return (
    <div className="space-y-5">
      <Card>
        <AccountDataEntriesForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={3} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <AccountDataEntriesResult data={state.data} /> : null}

      {state.status === "idle" ? <AccountDataEntriesEmptyState /> : null}
    </div>
  );
}
