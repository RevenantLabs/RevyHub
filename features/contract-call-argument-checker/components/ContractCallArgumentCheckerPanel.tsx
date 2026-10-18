"use client";

import { Card, StatusMessage } from "@/core/ui";
import { copy, errorCopy } from "../copy";
import { useContractCallArgumentChecker } from "../hooks/useContractCallArgumentChecker";
import { ContractCallArgumentCheckerEmptyState } from "./ContractCallArgumentCheckerEmptyState";
import { ContractCallArgumentCheckerForm } from "./ContractCallArgumentCheckerForm";
import { ContractCallArgumentCheckerResult } from "./ContractCallArgumentCheckerResult";

export function ContractCallArgumentCheckerPanel() {
  const { state, submit, reset } = useContractCallArgumentChecker();
  return (
    <div className="space-y-5">
      <p>{copy.description}</p>
      <Card>
        <ContractCallArgumentCheckerForm onSubmit={submit} onEdit={reset} pending={state.status === "loading"} />
      </Card>
      {state.status === "idle" ? <ContractCallArgumentCheckerEmptyState /> : null}
      {state.status === "loading" ? <p role="status">{copy.loading}</p> : null}
      {state.status === "error" ? <StatusMessage type="error" {...errorCopy[state.code]} /> : null}
      {state.status === "success" ? <ContractCallArgumentCheckerResult result={state.result} /> : null}
    </div>
  );
}
