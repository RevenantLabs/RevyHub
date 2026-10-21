"use client";
import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useOperationResultXdrDecoder } from "../hooks/useOperationResultXdrDecoder";
import { copy, errorCopy } from "../copy";
import { OperationResultXdrDecoderForm } from "./OperationResultXdrDecoderForm";
import { OperationResultXdrDecoderResult } from "./OperationResultXdrDecoderResult";
import { OperationResultXdrDecoderEmptyState } from "./OperationResultXdrDecoderEmptyState";
export function OperationResultXdrDecoderPanel() {
  const { state, submit } = useOperationResultXdrDecoder();
  return <div className="space-y-5"><Card><OperationResultXdrDecoderForm onSubmit={submit} pending={state.status === "loading"} /></Card>
    {state.status === "loading" && <StatusMessage type="info" title={copy.loading} description={copy.emptyDescription} />}
    {state.status === "error" && <StatusMessage type="error" title={errorCopy[state.code].title} description={errorCopy[state.code].description} />}
    {state.status === "success" && <OperationResultXdrDecoderResult result={state.result} />}
    {state.status === "idle" && <OperationResultXdrDecoderEmptyState />}
  </div>;
}
