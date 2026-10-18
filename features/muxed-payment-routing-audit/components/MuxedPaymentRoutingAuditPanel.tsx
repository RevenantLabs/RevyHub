"use client";
import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useMuxedPaymentRoutingAudit } from "@/features/muxed-payment-routing-audit/hooks/useMuxedPaymentRoutingAudit";
import { copy, errorCopy } from "@/features/muxed-payment-routing-audit/copy";
import { MuxedPaymentRoutingAuditForm } from "@/features/muxed-payment-routing-audit/components/MuxedPaymentRoutingAuditForm";
import { MuxedPaymentRoutingAuditResult } from "@/features/muxed-payment-routing-audit/components/MuxedPaymentRoutingAuditResult";
import { MuxedPaymentRoutingAuditEmptyState } from "@/features/muxed-payment-routing-audit/components/MuxedPaymentRoutingAuditEmptyState";
export function MuxedPaymentRoutingAuditPanel() {
  const { state, submit } = useMuxedPaymentRoutingAudit();
  return <div className="space-y-5">
    <Card><MuxedPaymentRoutingAuditForm onSubmit={submit} pending={state.status === "loading"} invalid={state.status === "error" && state.code === "invalid_account"} /></Card>
    {state.status === "loading" ? <StatusMessage type="info" title={copy.loading} /> : null}
    {state.status === "error" && state.code !== "invalid_account" ? <StatusMessage type="error" title={errorCopy[state.code].title} description={errorCopy[state.code].description} /> : null}
    {state.status === "success" ? <MuxedPaymentRoutingAuditResult result={state.result} /> : null}
    {state.status === "idle" ? <MuxedPaymentRoutingAuditEmptyState /> : null}
  </div>;
}
