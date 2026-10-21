"use client";

import { Card, StatusMessage } from "@/core/ui";
import { copy, errorCopy } from "../copy";
import { useSorobanRestoreReadiness } from "../hooks/useSorobanRestoreReadiness";
import { SorobanRestoreReadinessEmptyState } from "./SorobanRestoreReadinessEmptyState";
import { SorobanRestoreReadinessForm } from "./SorobanRestoreReadinessForm";
import { SorobanRestoreReadinessResult } from "./SorobanRestoreReadinessResult";

export function SorobanRestoreReadinessPanel() {
  const { state, submit, reset } = useSorobanRestoreReadiness();
  return (
    <div className="space-y-5">
      <p>{copy.description}</p>
      <Card>
        <SorobanRestoreReadinessForm onSubmit={submit} onEdit={reset} pending={state.status === "loading"} />
      </Card>
      {state.status === "idle" ? <SorobanRestoreReadinessEmptyState /> : null}
      {state.status === "loading" ? <p role="status">{copy.loading}</p> : null}
      {state.status === "error" ? <StatusMessage type="error" {...errorCopy[state.code]} /> : null}
      {state.status === "success" ? <SorobanRestoreReadinessResult result={state.result} /> : null}
    </div>
  );
}
