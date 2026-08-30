"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAccountDataEntries } from "@/features/account-data-entries/hooks/useAccountDataEntries";
import { errorCopy } from "@/features/account-data-entries/copy";
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

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <AccountDataEntriesResult result={state.result} /> : null}

      {state.status === "idle" ? <AccountDataEntriesEmptyState /> : null}
    </div>
  );
}
