"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useContractStorage } from "@/features/contract-storage/hooks/useContractStorage";
import { copy, errorCopy } from "@/features/contract-storage/copy";
import { ContractStorageForm } from "@/features/contract-storage/components/ContractStorageForm";
import { ContractStorageResult } from "@/features/contract-storage/components/ContractStorageResult";
import { ContractStorageEmptyState } from "@/features/contract-storage/components/ContractStorageEmptyState";

export function ContractStoragePanel() {
  const { state, submit } = useContractStorage();

  return (
    <div className="space-y-5">
      <Card>
        <ContractStorageForm onSubmit={submit} pending={state.status === "loading"} />
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

      {state.status === "success" ? <ContractStorageResult result={state.result} /> : null}

      {state.status === "idle" ? <ContractStorageEmptyState /> : null}
    </div>
  );
}
