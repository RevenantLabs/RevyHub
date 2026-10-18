"use client";

import { Card, StatusMessage } from "@/core/ui";
import { copy, errorCopy } from "../copy";
import { useContractCodeHashVerifier } from "../hooks/useContractCodeHashVerifier";
import { ContractCodeHashVerifierEmptyState } from "./ContractCodeHashVerifierEmptyState";
import { ContractCodeHashVerifierForm } from "./ContractCodeHashVerifierForm";
import { ContractCodeHashVerifierResult } from "./ContractCodeHashVerifierResult";

export function ContractCodeHashVerifierPanel() {
  const { state, submit, reset } = useContractCodeHashVerifier();
  return (
    <div className="space-y-5">
      <p>{copy.description}</p>
      <Card>
        <ContractCodeHashVerifierForm onSubmit={submit} onEdit={reset} pending={state.status === "loading"} />
      </Card>
      {state.status === "idle" ? <ContractCodeHashVerifierEmptyState /> : null}
      {state.status === "loading" ? <p role="status">{copy.loading}</p> : null}
      {state.status === "error" ? <StatusMessage type="error" {...errorCopy[state.code]} /> : null}
      {state.status === "success" ? <ContractCodeHashVerifierResult result={state.result} /> : null}
    </div>
  );
}
