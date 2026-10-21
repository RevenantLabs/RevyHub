"use client";

import { Card, StatusMessage } from "@/core/ui";
import { copy, errorCopy } from "../copy";
import { useClawbackEligibilityChecker } from "../hooks/useClawbackEligibilityChecker";
import { ClawbackEligibilityCheckerEmptyState } from "./ClawbackEligibilityCheckerEmptyState";
import { ClawbackEligibilityCheckerForm } from "./ClawbackEligibilityCheckerForm";
import { ClawbackEligibilityCheckerResult } from "./ClawbackEligibilityCheckerResult";

export function ClawbackEligibilityCheckerPanel() {
  const { state, submit, reset } = useClawbackEligibilityChecker();
  return (
    <div className="space-y-5">
      <p>{copy.description}</p>
      <Card>
        <ClawbackEligibilityCheckerForm onSubmit={submit} onEdit={reset} pending={state.status === "loading"} />
      </Card>
      {state.status === "idle" ? <ClawbackEligibilityCheckerEmptyState /> : null}
      {state.status === "loading" ? <p role="status">{copy.loading}</p> : null}
      {state.status === "error" ? <StatusMessage type="error" {...errorCopy[state.code]} /> : null}
      {state.status === "success" ? <ClawbackEligibilityCheckerResult result={state.result} /> : null}
    </div>
  );
}
