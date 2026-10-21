"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useRegulatedAssetInspector } from "@/features/regulated-asset-inspector/hooks/useRegulatedAssetInspector";
import { copy, errorCopy } from "@/features/regulated-asset-inspector/copy";
import { RegulatedAssetInspectorForm } from "@/features/regulated-asset-inspector/components/RegulatedAssetInspectorForm";
import { RegulatedAssetInspectorResult } from "@/features/regulated-asset-inspector/components/RegulatedAssetInspectorResult";
import { RegulatedAssetInspectorEmptyState } from "@/features/regulated-asset-inspector/components/RegulatedAssetInspectorEmptyState";

export function RegulatedAssetInspectorPanel() {
  const { state, submit } = useRegulatedAssetInspector();
  const errorCode = state.status === "error" ? state.code : null;
  const errorField = state.status === "error" ? state.field : null;

  return (
    <div className="space-y-5">
      <Card>
        <RegulatedAssetInspectorForm
          onSubmit={submit}
          pending={state.status === "loading"}
          errorField={errorField}
          errorCode={errorCode}
        />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={3} />
        </Card>
      ) : null}

      {state.status === "error" && !errorField ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <RegulatedAssetInspectorResult result={state.result} /> : null}
      {state.status === "idle" ? <RegulatedAssetInspectorEmptyState /> : null}
    </div>
  );
}
