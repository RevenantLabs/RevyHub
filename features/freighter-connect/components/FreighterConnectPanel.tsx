"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useNetwork } from "@/core/network/NetworkProvider";
import { useFreighter } from "@/features/freighter-connect/hooks/useFreighter";
import { copy, errorCopy } from "@/features/freighter-connect/copy";
import { hasNetworkMismatch } from "@/features/freighter-connect/lib/format";
import { FreighterConnectForm } from "@/features/freighter-connect/components/FreighterConnectForm";
import { FreighterConnectResult } from "@/features/freighter-connect/components/FreighterConnectResult";
import { FreighterConnectEmptyState } from "@/features/freighter-connect/components/FreighterConnectEmptyState";

export function FreighterConnectPanel() {
  const { state, refresh, connect } = useFreighter();
  const { network } = useNetwork();

  const snapshot = state.status === "ready" ? state.snapshot : null;
  const mismatch = snapshot ? hasNetworkMismatch(snapshot, network) : false;

  return (
    <div className="space-y-5">
      <Card>
        <FreighterConnectForm
          pending={state.status === "checking"}
          canConnect={Boolean(snapshot && !snapshot.allowed)}
          onRefresh={refresh}
          onConnect={connect}
        />
      </Card>

      {state.status === "checking" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.checking}
          </p>
          <SkeletonRows rows={2} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type={state.code === "not_installed" ? "info" : "error"}
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
          action={
            state.code === "not_installed" ? (
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm font-bold text-[#146783] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47a8c7]"
              >
                {copy.installLink}
              </a>
            ) : null
          }
        />
      ) : null}

      {mismatch ? (
        <StatusMessage
          type="warning"
          title={copy.mismatchTitle}
          description={copy.mismatchDescription}
        />
      ) : null}

      {snapshot ? <FreighterConnectResult snapshot={snapshot} appNetwork={network} /> : null}

      {state.status === "checking" ? <FreighterConnectEmptyState /> : null}
    </div>
  );
}
