"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useLedgerHeaderDecoder } from "@/features/ledger-header-decoder/hooks/useLedgerHeaderDecoder";
import { copy, errorCopy } from "@/features/ledger-header-decoder/copy";
import { LedgerHeaderDecoderForm } from "@/features/ledger-header-decoder/components/LedgerHeaderDecoderForm";
import { LedgerHeaderDecoderResult } from "@/features/ledger-header-decoder/components/LedgerHeaderDecoderResult";
import { LedgerHeaderDecoderEmptyState } from "@/features/ledger-header-decoder/components/LedgerHeaderDecoderEmptyState";

export function LedgerHeaderDecoderPanel() {
  const { state, submit } = useLedgerHeaderDecoder();
  return (
    <div className="space-y-5">
      <Card><LedgerHeaderDecoderForm onSubmit={submit} pending={state.status === "loading"} /></Card>
      {state.status === "loading" ? <p role="status">{copy.loading}</p> : null}
      {state.status === "error" ? <StatusMessage type="error" title={errorCopy[state.code].title} description={errorCopy[state.code].description} /> : null}
      {state.status === "success" ? <LedgerHeaderDecoderResult result={state.result} /> : null}
      {state.status === "idle" ? <LedgerHeaderDecoderEmptyState /> : null}
    </div>
  );
}
