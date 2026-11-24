"use client";
import { Card } from "@/core/ui/Card";
import { Button } from "@/core/ui/Button";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy } from "../copy";
import { useSorobanAuthNonceExpiryAuditor } from "../hooks/useSorobanAuthNonceExpiryAuditor";
import { SorobanAuthNonceExpiryAuditorForm } from "./SorobanAuthNonceExpiryAuditorForm";
import { SorobanAuthNonceExpiryAuditorResult } from "./SorobanAuthNonceExpiryAuditorResult";
import { SorobanAuthNonceExpiryAuditorEmptyState } from "./SorobanAuthNonceExpiryAuditorEmptyState";
export function SorobanAuthNonceExpiryAuditorPanel() {
  const {state, submit, reset, redactions} = useSorobanAuthNonceExpiryAuditor();
  return <div className="space-y-5"><Card><SorobanAuthNonceExpiryAuditorForm key={redactions} onSubmit={submit} onEdit={reset} pending={state.status === "loading"}/></Card>
    {state.status === "loading" ? <StatusMessage type="info" title={copy.working}/> : null}
    {state.status === "error" ? <StatusMessage type="error" title={errorCopy[state.code].title} description={errorCopy[state.code].description}/> : null}
    {state.status === "success" ? <SorobanAuthNonceExpiryAuditorResult result={state.result}/> : null}
    {state.status === "idle" ? <SorobanAuthNonceExpiryAuditorEmptyState/> : null}
    {state.status !== "idle" ? <Button type="button" variant="secondary" onClick={reset}>{copy.reset}</Button> : null}
  </div>;
}
