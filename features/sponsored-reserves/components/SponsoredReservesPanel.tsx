"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useSponsoredReserves } from "@/features/sponsored-reserves/hooks/useSponsoredReserves";
import { errorCopy } from "@/features/sponsored-reserves/copy";
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

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <SponsoredReservesResult result={state.result} /> : null}

      {state.status === "idle" ? <SponsoredReservesEmptyState /> : null}
    </div>
  );
}
