"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { AssetIdentityValidatorEmptyState } from "@/features/asset-identity-validator/components/AssetIdentityValidatorEmptyState";
import { AssetIdentityValidatorForm } from "@/features/asset-identity-validator/components/AssetIdentityValidatorForm";
import { AssetIdentityValidatorResult } from "@/features/asset-identity-validator/components/AssetIdentityValidatorResult";
import { copy, errorCopy } from "@/features/asset-identity-validator/copy";
import { useAssetIdentityValidator } from "@/features/asset-identity-validator/hooks/useAssetIdentityValidator";

export function AssetIdentityValidatorPanel() {
  const { state, submit } = useAssetIdentityValidator();
  const pending = state.status === "loading";

  return (
    <div className="w-full min-w-0 space-y-5">
      <Card>
        <AssetIdentityValidatorForm onSubmit={submit} pending={pending} />
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

      {state.status === "success" ? <AssetIdentityValidatorResult result={state.result} /> : null}

      {state.status === "idle" ? <AssetIdentityValidatorEmptyState /> : null}
    </div>
  );
}
