"use client";

import Link from "next/link";
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
          action={
            state.code === "account_not_found" ? (
              <Link
                href="/tools/testnet-faucet"
                className="font-semibold text-[#9f342d] underline underline-offset-2"
              >
                Open Testnet Faucet Helper
              </Link>
            ) : undefined
          }
        />
      ) : null}

      {state.status === "success" ? <BalanceViewerResult data={state.data} /> : null}

      {state.status === "idle" ? <BalanceViewerEmptyState /> : null}
    </div>
  );
}
