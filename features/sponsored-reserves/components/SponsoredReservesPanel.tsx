"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useSponsoredReserves } from "@/features/sponsored-reserves/hooks/useSponsoredReserves";
import { copy, errorCopy } from "@/features/sponsored-reserves/copy";
import { SponsoredReservesForm } from "@/features/sponsored-reserves/components/SponsoredReservesForm";
import { SponsoredReservesResult } from "@/features/sponsored-reserves/components/SponsoredReservesResult";
import { SponsoredReservesEmptyState } from "@/features/sponsored-reserves/components/SponsoredReservesEmptyState";

export function SponsoredReservesPanel() {
  const { state, submit } = useSponsoredReserves();

  return (
    <div className="space-y-5">
      <Card>
        <SponsoredReservesForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={3} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <SponsoredReservesResult data={state.data} /> : null}

      {state.status === "idle" ? <SponsoredReservesEmptyState /> : null}
    </div>
  );
}
