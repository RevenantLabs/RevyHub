"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useOfferInspector } from "@/features/offer-inspector/hooks/useOfferInspector";
import { copy, errorCopy } from "@/features/offer-inspector/copy";
import { OfferInspectorForm } from "@/features/offer-inspector/components/OfferInspectorForm";
import { OfferInspectorResult } from "@/features/offer-inspector/components/OfferInspectorResult";
import { OfferInspectorEmptyState } from "@/features/offer-inspector/components/OfferInspectorEmptyState";

export function OfferInspectorPanel() {
  const { state, submit, loadMore } = useOfferInspector();

  return (
    <div className="space-y-5">
      <Card>
        <OfferInspectorForm
          onSubmit={submit}
          pending={state.status === "loading"}
        />
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

      {state.status === "success" ? (
        <OfferInspectorResult
          result={state.result}
          onLoadMore={loadMore}
          loadingMore={state.loadingMore}
        />
      ) : null}

      {state.status === "idle" ? <OfferInspectorEmptyState /> : null}
    </div>
  );
}

