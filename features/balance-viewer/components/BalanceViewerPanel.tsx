"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useBalanceViewer } from "@/features/balance-viewer/hooks/useBalanceViewer";
import { copy, errorCopy } from "@/features/balance-viewer/copy";
import { BalanceViewerForm } from "@/features/balance-viewer/components/BalanceViewerForm";
import { BalanceViewerResult } from "@/features/balance-viewer/components/BalanceViewerResult";
import { BalanceViewerEmptyState } from "@/features/balance-viewer/components/BalanceViewerEmptyState";

export function BalanceViewerPanel() {
  const { state, submit } = useBalanceViewer();

  return (
    <div className="space-y-5">
      <Card>
        <BalanceViewerForm onSubmit={submit} pending={state.status === "loading"} />
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

      {state.status === "success" ? <BalanceViewerResult data={state.data} /> : null}

      {state.status === "idle" ? <BalanceViewerEmptyState /> : null}
    </div>
  );
}
