"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useContractMetadataViewer } from "@/features/contract-metadata-viewer/hooks/useContractMetadataViewer";
import { errorCopy } from "@/features/contract-metadata-viewer/copy";
import { ContractMetadataViewerForm } from "@/features/contract-metadata-viewer/components/ContractMetadataViewerForm";
import { ContractMetadataViewerResult } from "@/features/contract-metadata-viewer/components/ContractMetadataViewerResult";
import { ContractMetadataViewerEmptyState } from "@/features/contract-metadata-viewer/components/ContractMetadataViewerEmptyState";

export function ContractMetadataViewerPanel() {
  const { state, submit } = useContractMetadataViewer();

  return (
    <div className="space-y-5">
      <Card>
        <ContractMetadataViewerForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <ContractMetadataViewerResult result={state.result} /> : null}

      {state.status === "idle" ? <ContractMetadataViewerEmptyState /> : null}
    </div>
  );
}
