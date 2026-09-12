"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useLedgerLookup } from "@/features/ledger-lookup/hooks/useLedgerLookup";
import { copy, errorCopy } from "@/features/ledger-lookup/copy";
import { LedgerLookupForm } from "@/features/ledger-lookup/components/LedgerLookupForm";
import { LedgerLookupResult } from "@/features/ledger-lookup/components/LedgerLookupResult";
import { LedgerLookupEmptyState } from "@/features/ledger-lookup/components/LedgerLookupEmptyState";

/** Main container panel orchestrating input, loading, success and error states. */
export function LedgerLookupPanel() {
  const { state, submit } = useLedgerLookup();

  return (
    <div className="space-y-5">
      <Card>
        <LedgerLookupForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={6} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={
            state.code === "future_ledger" && state.detail?.currentHeight !== undefined
              ? copy.futureLedgerWithHeight(state.detail.currentHeight)
              : errorCopy[state.code].description
          }
        />
      ) : null}

      {state.status === "success" ? (
        <LedgerLookupResult ledger={state.ledger} />
      ) : null}

      {state.status === "idle" ? <LedgerLookupEmptyState /> : null}
    </div>
  );
}
