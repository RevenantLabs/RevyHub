"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { LedgerCloseCadenceEmptyState } from "@/features/ledger-close-cadence/components/LedgerCloseCadenceEmptyState";
import { LedgerCloseCadenceForm } from "@/features/ledger-close-cadence/components/LedgerCloseCadenceForm";
import { LedgerCloseCadenceResultView } from "@/features/ledger-close-cadence/components/LedgerCloseCadenceResult";
import { copy, errorCopy } from "@/features/ledger-close-cadence/copy";
import { useLedgerCloseCadence } from "@/features/ledger-close-cadence/hooks/useLedgerCloseCadence";

export function LedgerCloseCadencePanel() {
  const { state, submit } = useLedgerCloseCadence();

  return (
    <div className="space-y-5">
      <Card>
        <LedgerCloseCadenceForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <LedgerCloseCadenceResultView result={state.result} /> : null}

      {state.status === "idle" ? <LedgerCloseCadenceEmptyState /> : null}
    </div>
  );
}
