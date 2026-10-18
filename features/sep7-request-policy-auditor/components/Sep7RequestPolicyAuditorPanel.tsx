"use client";

import { Card, StatusMessage } from "@/core/ui";
import { copy, errorCopy } from "../copy";
import { useSep7RequestPolicyAuditor } from "../hooks/useSep7RequestPolicyAuditor";
import { Sep7RequestPolicyAuditorEmptyState } from "./Sep7RequestPolicyAuditorEmptyState";
import { Sep7RequestPolicyAuditorForm } from "./Sep7RequestPolicyAuditorForm";
import { Sep7RequestPolicyAuditorResult } from "./Sep7RequestPolicyAuditorResult";

export function Sep7RequestPolicyAuditorPanel() {
  const { state, submit, reset } = useSep7RequestPolicyAuditor();
  return (
    <div className="space-y-5">
      <p>{copy.description}</p>
      <Card>
        <Sep7RequestPolicyAuditorForm onSubmit={submit} onEdit={reset} pending={state.status === "loading"} />
      </Card>
      {state.status === "idle" ? <Sep7RequestPolicyAuditorEmptyState /> : null}
      {state.status === "loading" ? <p role="status">{copy.loading}</p> : null}
      {state.status === "error" ? <StatusMessage type="error" {...errorCopy[state.code]} /> : null}
      {state.status === "success" ? <Sep7RequestPolicyAuditorResult result={state.result} /> : null}
    </div>
  );
}
