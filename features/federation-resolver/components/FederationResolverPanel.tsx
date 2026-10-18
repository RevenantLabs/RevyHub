"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useFederationResolver } from "@/features/federation-resolver/hooks/useFederationResolver";
import { copy, errorCopy } from "@/features/federation-resolver/copy";
import { FederationResolverForm } from "@/features/federation-resolver/components/FederationResolverForm";
import { FederationResolverResult } from "@/features/federation-resolver/components/FederationResolverResult";
import { FederationResolverEmptyState } from "@/features/federation-resolver/components/FederationResolverEmptyState";

export function FederationResolverPanel() {
  const { state, submit } = useFederationResolver();

  return (
    <div className="space-y-5">
      <Card>
        <FederationResolverForm onSubmit={submit} pending={state.status === "loading"} />
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

      {state.status === "success" ? (
        <FederationResolverResult resolution={state.resolution} />
      ) : null}

      {state.status === "idle" ? <FederationResolverEmptyState /> : null}
    </div>
  );
}
