"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useSponsorshipPlanner } from "@/features/sponsorship-planner/hooks/useSponsorshipPlanner";
import { copy, errorCopy } from "@/features/sponsorship-planner/copy";
import { SponsorshipPlannerForm } from "@/features/sponsorship-planner/components/SponsorshipPlannerForm";
import { SponsorshipPlannerResult } from "@/features/sponsorship-planner/components/SponsorshipPlannerResult";
import { SponsorshipPlannerEmptyState } from "@/features/sponsorship-planner/components/SponsorshipPlannerEmptyState";

export function SponsorshipPlannerPanel() {
  const { state, submit } = useSponsorshipPlanner();
  const fieldError = state.status === "error" ? state : null;

  return (
    <div className="space-y-5">
      <Card>
        <SponsorshipPlannerForm
          onSubmit={submit}
          pending={state.status === "loading"}
          errorField={fieldError?.field ?? null}
          errorMessage={fieldError ? errorCopy[fieldError.code].title : null}
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

      {/*
        A field-level error is already announced by the input's own alert.
        Repeating it in a banner would announce the same problem twice, so the
        banner is reserved for failures that belong to no single field.
      */}
      {state.status === "error" && !state.field ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <SponsorshipPlannerResult data={state.data} /> : null}

      {state.status === "idle" ? <SponsorshipPlannerEmptyState /> : null}
    </div>
  );
}
