"use client";
import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy } from "@/features/horizon-rate-limit-monitor/copy";
import { useHorizonRateLimitMonitor } from "@/features/horizon-rate-limit-monitor/hooks/useHorizonRateLimitMonitor";
import { HorizonRateLimitMonitorForm } from "@/features/horizon-rate-limit-monitor/components/HorizonRateLimitMonitorForm";
import { HorizonRateLimitMonitorResult } from "@/features/horizon-rate-limit-monitor/components/HorizonRateLimitMonitorResult";
import { HorizonRateLimitMonitorEmptyState } from "@/features/horizon-rate-limit-monitor/components/HorizonRateLimitMonitorEmptyState";

export function HorizonRateLimitMonitorPanel() {
  const { state, check } = useHorizonRateLimitMonitor();
  return <div className="space-y-5">
    <Card><HorizonRateLimitMonitorForm onCheck={check} pending={state.status === "loading"} loaded={state.status === "success"} error={state.status === "error" ? state.code : undefined} /></Card>
    {state.status === "idle" && <HorizonRateLimitMonitorEmptyState />}
    {state.status === "loading" && <Card><p role="status" className="sr-only">{copy.loading}</p><SkeletonRows rows={3} /></Card>}
    {state.status === "error" && state.code !== "invalid_account" && state.code !== "invalid_threshold" && <StatusMessage type="error" title={errorCopy[state.code].title} description={errorCopy[state.code].description} />}
    {state.status === "success" && <HorizonRateLimitMonitorResult result={state.result} />}
  </div>;
}
