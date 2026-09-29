"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, AlertCircle, Clock, Cpu, Layers, Network, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { StellarNetwork } from "@/lib/stellar/horizon";
import {
  describeFreshness,
  sorobanDiagnostic,
  SorobanRpcError,
  STALE_LEDGER_SECONDS,
  type SorobanDiagnosticResult
} from "@/lib/stellar/soroban";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SorobanHealthPanelProps {
  network: StellarNetwork;
}

type PanelState =
  | { status: "loading" }
  | { status: "success"; data: SorobanDiagnosticResult }
  | { status: "error"; kind: string; message: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function freshBadgeTone(freshnessSeconds: number | null): "success" | "warning" | "muted" {
  if (freshnessSeconds === null) return "muted";
  if (freshnessSeconds < 30) return "success";
  if (freshnessSeconds < STALE_LEDGER_SECONDS) return "warning";
  return "warning";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SorobanHealthPanel({ network }: SorobanHealthPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>({ status: "loading" });
  const controllerRef = useRef<AbortController | null>(null);

  /** Shared diagnostic runner used by the refresh button (event handler). */
  const runDiagnostic = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setPanelState({ status: "loading" });

    try {
      const data = await sorobanDiagnostic(network, controller.signal);
      if (controller.signal.aborted) return;
      setPanelState({ status: "success", data });
    } catch (error) {
      if (controller.signal.aborted) return;
      const kind = error instanceof SorobanRpcError ? error.kind : "unknown";
      const message = error instanceof Error ? error.message : "Unexpected error.";
      setPanelState({ status: "error", kind, message });
    }
  }, [network]);

  // Initial fetch on mount and when network changes.
  // The linter warning is intentionally suppressed because setPanelState
  // is only called asynchronously inside .then()/.catch() callbacks,
  // not synchronously in the effect body.
  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;

    // No synchronous setState call here — the loading state is the default.

    sorobanDiagnostic(network, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setPanelState({ status: "success", data });
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        const kind = error instanceof SorobanRpcError ? error.kind : "unknown";
        const message = error instanceof Error ? error.message : "Unexpected error.";
        setPanelState({ status: "error", kind, message });
      });

    return () => controller.abort();
  }, [network]);

  const checkedAtLabel =
    panelState.status === "success"
      ? new Date(panelState.data.checkedAt * 1000).toLocaleTimeString()
      : null;

  return (
    <Card className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[#82cbe3]/70 bg-[#e0f6ff]">
            <Activity className="h-5 w-5 text-[#146783]" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#9a6754]">
              Soroban RPC — {network}
            </p>
            <h2 className="text-lg font-black text-[#172033]">Node Health Diagnostic</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={runDiagnostic}
          disabled={panelState.status === "loading"}
          className="inline-flex items-center gap-2 rounded-full border border-[#82cbe3]/70 bg-[#e0f6ff] px-4 py-2 text-sm font-extrabold text-[#146783] transition-all hover:bg-[#c3edfc] hover:shadow-[0_3px_10px_rgba(130,203,227,0.35)] disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${panelState.status === "loading" ? "animate-spin" : ""}`}
            aria-hidden
          />
          {panelState.status === "loading" ? "Checking…" : "Refresh"}
        </button>
      </div>

      {/* Error state */}
      {panelState.status === "error" ? (
        <div className="rounded-lg border border-[#ff9a8b]/75 bg-[#fff0ee] p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#9f342d]" aria-hidden />
            <div>
              <p className="text-sm font-extrabold text-[#9f342d]">
                {capitalizeKind(panelState.kind)}
              </p>
              <p className="mt-1 text-sm text-[#4e5c73]">{panelState.message}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Loading skeleton */}
      {panelState.status === "loading" ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 rounded bg-[#e0e3ea]" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-16 rounded bg-[#e0e3ea]" />
                <div className="h-6 w-24 rounded bg-[#e0e3ea]" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Success state - metric tiles */}
      {panelState.status === "success" ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {/* Health status */}
            <MetricTile
              icon={<Activity className="h-4 w-4" aria-hidden />}
              label="Health"
              value={
                <Badge
                  tone={
                    panelState.data.health.status === "healthy" ? "success" : "warning"
                  }
                >
                  {panelState.data.health.status}
                </Badge>
              }
            />

            {/* Ledger sequence */}
            <MetricTile
              icon={<Layers className="h-4 w-4" aria-hidden />}
              label="Latest Ledger"
              value={
                <span className="font-mono text-lg font-bold text-[#172033]">
                  {panelState.data.latestLedger.sequence.toLocaleString()}
                </span>
              }
            />

            {/* Protocol version */}
            <MetricTile
              icon={<Cpu className="h-4 w-4" aria-hidden />}
              label="Protocol"
              value={
                <span className="text-lg font-bold text-[#172033]">
                  {panelState.data.latestLedger.protocolVersion}
                </span>
              }
            />

            {/* Latency */}
            <MetricTile
              icon={<Network className="h-4 w-4" aria-hidden />}
              label="Latency"
              value={
                <span
                  className={`text-lg font-bold ${
                    panelState.data.latencyMs < 500
                      ? "text-[#17664b]"
                      : panelState.data.latencyMs < 2000
                        ? "text-[#9a513f]"
                        : "text-[#9f342d]"
                  }`}
                >
                  {panelState.data.latencyMs}ms
                </span>
              }
            />

            {/* Freshness */}
            <MetricTile
              icon={<Clock className="h-4 w-4" aria-hidden />}
              label="Freshness"
              value={
                <Badge tone={freshBadgeTone(panelState.data.freshnessSeconds)}>
                  {describeFreshness(panelState.data.freshnessSeconds)}
                </Badge>
              }
            />

            {/* Ledger ID (truncated) */}
            <MetricTile
              icon={<Layers className="h-4 w-4" aria-hidden />}
              label="Ledger Hash"
              value={
                <span className="font-mono text-sm font-bold text-[#172033]">
                  {panelState.data.latestLedger.id.slice(0, 12)}…
                </span>
              }
            />
          </div>

          {/* Extra health details */}
          <div className="rounded-lg border border-[#e0e3ea] bg-white/60 p-3">
            <div className="grid gap-2 text-sm text-[#4e5c73] sm:grid-cols-3">
              <div>
                <span className="font-semibold text-[#29364d]">Retention:</span>{" "}
                {panelState.data.health.ledgerRetentionWindow.toLocaleString()} ledgers
              </div>
              <div>
                <span className="font-semibold text-[#29364d]">Oldest:</span> #
                {panelState.data.health.oldestLedger.toLocaleString()}
              </div>
              <div>
                <span className="font-semibold text-[#29364d]">Latest:</span> #
                {panelState.data.health.latestLedger.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Last checked timestamp */}
          <p className="text-xs text-[#68758a]">
            Last checked at {checkedAtLabel}
          </p>
        </>
      ) : null}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetricTile({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#e0e3ea] bg-white/65 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#68758a]">
        {icon}
        {label}
      </div>
      <div className="mt-2">{value}</div>
    </div>
  );
}

function capitalizeKind(kind: string): string {
  return kind
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
