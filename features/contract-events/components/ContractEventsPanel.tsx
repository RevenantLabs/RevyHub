"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useContractEvents } from "@/features/contract-events/hooks/useContractEvents";
import { copy, errorCopy } from "@/features/contract-events/copy";
import { ContractEventsForm } from "@/features/contract-events/components/ContractEventsForm";
import { ContractEventsResult } from "@/features/contract-events/components/ContractEventsResult";
import { ContractEventsEmptyState } from "@/features/contract-events/components/ContractEventsEmptyState";

export function ContractEventsPanel() {
  const { state, submit } = useContractEvents();

  return (
    <div className="space-y-5">
      <Card>
        <ContractEventsForm onSubmit={submit} pending={state.status === "loading"} />
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
          description={
            state.code === "range_outside_retention" &&
            state.detail?.latestLedger !== undefined ? (
              <>
                {errorCopy[state.code].description}{" "}
                {copy.availableRange(
                  state.detail.retentionStart ??
                    Math.max(1, state.detail.latestLedger - 17280 + 1),
                  state.detail.latestLedger
                )}
              </>
            ) : (
              errorCopy[state.code].description
            )
          }
        />
      ) : null}

      {state.status === "success" ? <ContractEventsResult result={state.result} /> : null}

      {state.status === "idle" ? <ContractEventsEmptyState /> : null}
    </div>
  );
}
