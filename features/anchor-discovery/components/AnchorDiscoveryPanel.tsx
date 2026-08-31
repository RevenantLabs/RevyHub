"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAnchorDiscovery } from "@/features/anchor-discovery/hooks/useAnchorDiscovery";
import { errorCopy } from "@/features/anchor-discovery/copy";
import { AnchorDiscoveryForm } from "@/features/anchor-discovery/components/AnchorDiscoveryForm";
import { AnchorDiscoveryResult } from "@/features/anchor-discovery/components/AnchorDiscoveryResult";
import { AnchorDiscoveryEmptyState } from "@/features/anchor-discovery/components/AnchorDiscoveryEmptyState";

export function AnchorDiscoveryPanel() {
  const { state, submit } = useAnchorDiscovery();

  return (
    <div className="space-y-5">
      <Card>
        <AnchorDiscoveryForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <AnchorDiscoveryResult result={state.result} /> : null}

      {state.status === "idle" ? <AnchorDiscoveryEmptyState /> : null}
    </div>
  );
}
