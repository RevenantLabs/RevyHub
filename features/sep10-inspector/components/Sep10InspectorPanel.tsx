"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useSep10Inspector } from "@/features/sep10-inspector/hooks/useSep10Inspector";
import { errorCopy } from "@/features/sep10-inspector/copy";
import { Sep10InspectorForm } from "@/features/sep10-inspector/components/Sep10InspectorForm";
import { Sep10InspectorResult } from "@/features/sep10-inspector/components/Sep10InspectorResult";
import { Sep10InspectorEmptyState } from "@/features/sep10-inspector/components/Sep10InspectorEmptyState";

export function Sep10InspectorPanel() {
  const { state, submit } = useSep10Inspector();

  return (
    <div className="space-y-5">
      <Card>
        <Sep10InspectorForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <Sep10InspectorResult result={state.result} /> : null}

      {state.status === "idle" ? <Sep10InspectorEmptyState /> : null}
    </div>
  );
}
