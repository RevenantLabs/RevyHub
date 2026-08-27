"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAccountSigners } from "@/features/account-signers/hooks/useAccountSigners";
import { copy, errorCopy } from "@/features/account-signers/copy";
import { AccountSignersForm } from "@/features/account-signers/components/AccountSignersForm";
import { AccountSignersResult } from "@/features/account-signers/components/AccountSignersResult";
import { AccountSignersEmptyState } from "@/features/account-signers/components/AccountSignersEmptyState";

export function AccountSignersPanel() {
  const { state, submit } = useAccountSigners();
  const fieldError =
    state.status === "error" &&
    (state.code === "empty_input" || state.code === "invalid_address")
      ? errorCopy[state.code].title
      : null;

  return (
    <div className="space-y-5">
      <Card>
        <AccountSignersForm
          onSubmit={submit}
          pending={state.status === "loading"}
          errorMessage={fieldError}
        />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={5} />
        </Card>
      ) : null}

      {state.status === "error" && !fieldError ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <AccountSignersResult result={state.result} /> : null}

      {state.status === "idle" ? <AccountSignersEmptyState /> : null}
    </div>
  );
}
