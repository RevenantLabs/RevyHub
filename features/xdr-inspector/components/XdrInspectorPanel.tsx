"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useXdrInspector } from "@/features/xdr-inspector/hooks/useXdrInspector";
import { errorCopy } from "@/features/xdr-inspector/copy";
import { XdrInspectorForm } from "@/features/xdr-inspector/components/XdrInspectorForm";
import { XdrInspectorResult } from "@/features/xdr-inspector/components/XdrInspectorResult";
import { XdrInspectorEmptyState } from "@/features/xdr-inspector/components/XdrInspectorEmptyState";

export function XdrInspectorPanel() {
  const { state, submit } = useXdrInspector();

  return (
    <div className="space-y-5">
      <Card>
        <XdrInspectorForm onSubmit={submit} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <XdrInspectorResult summary={state.summary} /> : null}

      {state.status === "idle" ? <XdrInspectorEmptyState /> : null}
    </div>
  );
}
