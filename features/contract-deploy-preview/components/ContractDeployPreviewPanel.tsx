"use client";

import { Card, StatusMessage } from "@/core/ui";
import { copy, errorCopy } from "../copy";
import { useContractDeployPreview } from "../hooks/useContractDeployPreview";
import { ContractDeployPreviewEmptyState } from "./ContractDeployPreviewEmptyState";
import { ContractDeployPreviewForm } from "./ContractDeployPreviewForm";
import { ContractDeployPreviewResult } from "./ContractDeployPreviewResult";
import { NoCreateOperationNotice } from "./NoCreateOperationNotice";

export function ContractDeployPreviewPanel() {
  const { state, submit, reset } = useContractDeployPreview();
  return (
    <div className="space-y-5">
      <p>{copy.description}</p>
      <Card>
        <ContractDeployPreviewForm onSubmit={submit} onEdit={reset} />
      </Card>
      {state.status === "idle" ? <ContractDeployPreviewEmptyState /> : null}
      {state.status === "error" && state.code === "no_create_contract_operation" ? (
        <NoCreateOperationNotice operationTypes={state.operationTypes} />
      ) : null}
      {state.status === "error" && state.code !== "no_create_contract_operation" ? (
        <StatusMessage type="error" {...errorCopy[state.code]} />
      ) : null}
      {state.status === "success" ? <ContractDeployPreviewResult result={state.result} /> : null}
    </div>
  );
}
