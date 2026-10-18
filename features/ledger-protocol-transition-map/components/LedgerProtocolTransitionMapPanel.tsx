"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { LedgerProtocolTransitionMapEmptyState } from "@/features/ledger-protocol-transition-map/components/LedgerProtocolTransitionMapEmptyState";
import { LedgerProtocolTransitionMapForm } from "@/features/ledger-protocol-transition-map/components/LedgerProtocolTransitionMapForm";
import { LedgerProtocolTransitionMapResultView } from "@/features/ledger-protocol-transition-map/components/LedgerProtocolTransitionMapResult";
import { copy, errorCopy } from "@/features/ledger-protocol-transition-map/copy";
import { useLedgerProtocolTransitionMap } from "@/features/ledger-protocol-transition-map/hooks/useLedgerProtocolTransitionMap";

export function LedgerProtocolTransitionMapPanel() {
  const { state, submit } = useLedgerProtocolTransitionMap();

  return (
    <div className="space-y-5">
      <Card>
        <LedgerProtocolTransitionMapForm onSubmit={submit} pending={state.status === "loading"} />
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

      {state.status === "success" ? (
        <LedgerProtocolTransitionMapResultView result={state.result} />
      ) : null}

      {state.status === "idle" ? <LedgerProtocolTransitionMapEmptyState /> : null}
    </div>
  );
}
