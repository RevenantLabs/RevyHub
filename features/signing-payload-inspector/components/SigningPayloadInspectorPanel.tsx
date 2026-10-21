"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useSigningPayloadInspector } from "@/features/signing-payload-inspector/hooks/useSigningPayloadInspector";
import { copy, errorCopy } from "@/features/signing-payload-inspector/copy";
import { SigningPayloadInspectorForm } from "@/features/signing-payload-inspector/components/SigningPayloadInspectorForm";
import { SigningPayloadInspectorResult } from "@/features/signing-payload-inspector/components/SigningPayloadInspectorResult";
import { SigningPayloadInspectorEmptyState } from "@/features/signing-payload-inspector/components/SigningPayloadInspectorEmptyState";

export function SigningPayloadInspectorPanel() {
  const { state, selectedNetwork, submit, changeNetwork } = useSigningPayloadInspector();
  return (
    <div className="space-y-5">
      <Card>
        <SigningPayloadInspectorForm onSubmit={submit} pending={state.status === "loading"}
          network={selectedNetwork} onNetworkChange={changeNetwork} />
      </Card>
      {state.status === "idle" ? <SigningPayloadInspectorEmptyState /> : null}
      {state.status === "loading" ? <StatusMessage type="info" title={copy.loading} /> : null}
      {state.status === "error" ? <StatusMessage type="error" title={errorCopy[state.code].title}
        description={errorCopy[state.code].description} /> : null}
      {state.status === "success" ? <SigningPayloadInspectorResult result={state.result} /> : null}
    </div>
  );
}
