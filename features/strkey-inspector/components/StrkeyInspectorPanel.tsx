"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useStrkeyInspector } from "@/features/strkey-inspector/hooks/useStrkeyInspector";
import { errorCopy } from "@/features/strkey-inspector/copy";
import { StrkeyInspectorForm } from "@/features/strkey-inspector/components/StrkeyInspectorForm";
import { StrkeyInspectorResult } from "@/features/strkey-inspector/components/StrkeyInspectorResult";
import { StrkeyInspectorEmptyState } from "@/features/strkey-inspector/components/StrkeyInspectorEmptyState";

export function StrkeyInspectorPanel() {
  const { state, submit } = useStrkeyInspector();

  return (
    <div className="space-y-5">
      <Card>
        <StrkeyInspectorForm
          onSubmit={submit}
          pending={state.status === "loading"}
        />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type={state.code === "secret_seed_rejected" ? "warning" : "error"}
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <StrkeyInspectorResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <StrkeyInspectorEmptyState /> : null}
    </div>
  );
}
