"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useTrustlineChecker } from "@/features/trustline-checker/hooks/useTrustlineChecker";
import { copy, errorCopy } from "@/features/trustline-checker/copy";
import { TrustlineCheckerForm } from "@/features/trustline-checker/components/TrustlineCheckerForm";
import { TrustlineCheckerResult } from "@/features/trustline-checker/components/TrustlineCheckerResult";
import { TrustlineCheckerEmptyState } from "@/features/trustline-checker/components/TrustlineCheckerEmptyState";

export function TrustlineCheckerPanel() {
  const { state, submit } = useTrustlineChecker();
  const fieldError = state.status === "error" ? state : null;

  return (
    <div className="space-y-5">
      <Card>
        <TrustlineCheckerForm
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
          <SkeletonRows rows={3} />
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

      {state.status === "success" ? <TrustlineCheckerResult result={state.result} /> : null}

      {state.status === "idle" ? <TrustlineCheckerEmptyState /> : null}
    </div>
  );
}
