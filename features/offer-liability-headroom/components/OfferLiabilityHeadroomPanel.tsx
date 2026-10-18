"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { OfferLiabilityHeadroomEmptyState } from "@/features/offer-liability-headroom/components/OfferLiabilityHeadroomEmptyState";
import { OfferLiabilityHeadroomForm } from "@/features/offer-liability-headroom/components/OfferLiabilityHeadroomForm";
import { OfferLiabilityHeadroomResultView } from "@/features/offer-liability-headroom/components/OfferLiabilityHeadroomResult";
import { copy, errorCopy } from "@/features/offer-liability-headroom/copy";
import { useOfferLiabilityHeadroom } from "@/features/offer-liability-headroom/hooks/useOfferLiabilityHeadroom";

export function OfferLiabilityHeadroomPanel() {
  const { state, submit } = useOfferLiabilityHeadroom();

  return (
    <div className="space-y-5">
      <Card>
        <OfferLiabilityHeadroomForm onSubmit={submit} pending={state.status === "loading"} />
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
        <OfferLiabilityHeadroomResultView result={state.result} />
      ) : null}

      {state.status === "idle" ? <OfferLiabilityHeadroomEmptyState /> : null}
    </div>
  );
}
