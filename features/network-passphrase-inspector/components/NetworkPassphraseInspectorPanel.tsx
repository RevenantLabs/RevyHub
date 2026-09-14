"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useNetworkPassphraseInspector } from "@/features/network-passphrase-inspector/hooks/useNetworkPassphraseInspector";
import { copy, errorCopy } from "@/features/network-passphrase-inspector/copy";
import { NetworkPassphraseInspectorForm } from "@/features/network-passphrase-inspector/components/NetworkPassphraseInspectorForm";
import { NetworkPassphraseInspectorResult } from "@/features/network-passphrase-inspector/components/NetworkPassphraseInspectorResult";
import { NetworkPassphraseInspectorEmptyState } from "@/features/network-passphrase-inspector/components/NetworkPassphraseInspectorEmptyState";

export function NetworkPassphraseInspectorPanel() {
  const { state, search } = useNetworkPassphraseInspector();

  return (
    <div className="space-y-5">
      <Card>
        <NetworkPassphraseInspectorForm onSubmit={search} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <NetworkPassphraseInspectorResult results={state.results} />
      ) : null}

      {state.status === "idle" ? <NetworkPassphraseInspectorEmptyState /> : null}
    </div>
  );
}
