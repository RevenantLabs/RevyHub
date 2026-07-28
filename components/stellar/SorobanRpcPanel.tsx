"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, ServerPulse } from "lucide-react";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { checkSorobanRpc, createSorobanRpcController, type SorobanRpcDiagnostic } from "@/lib/stellar/sorobanRpc";

const statusTone = {
  healthy: "success",
  stale: "warning",
  partial: "warning",
  unhealthy: "error",
  timeout: "error",
  "wrong-network": "error",
  malformed: "error",
  error: "error"
} as const;

export function SorobanRpcPanel() {
  const { network } = useNetwork();
  const [diagnostic, setDiagnostic] = useState<SorobanRpcDiagnostic | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const controller = useMemo(() => createSorobanRpcController(), []);

  const refresh = useCallback(async () => {
    setIsChecking(true);
    const signal = controller.nextSignal();
    const result = await checkSorobanRpc(network, { signal });

    if (!signal.aborted) {
      setDiagnostic(result);
      setIsChecking(false);
    }
  }, [controller, network]);

  useEffect(() => {
    void refresh();
    return () => controller.abort();
  }, [controller, refresh]);

  const checkedAt = diagnostic ? new Date(diagnostic.lastCheckedAt).toLocaleString() : "Not checked yet";

  return (
    <Card className="border-[#9bdcc8]/70 bg-[#f4fffb]/80">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <ServerPulse className="h-5 w-5 text-stellar-green" aria-hidden />
            <h2 className="text-lg font-semibold text-[#172033]">Soroban RPC diagnostic</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#4e5c73]">
            Checks the configured {network} RPC endpoint with health and latest-ledger JSON-RPC methods. Free-form RPC URLs are not accepted.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void refresh()} disabled={isChecking}>
          <RefreshCw className={isChecking ? "h-4 w-4 animate-spin" : "h-4 w-4"} aria-hidden />
          {isChecking ? "Checking" : "Refresh"}
        </Button>
      </div>

      <div className="mt-5">
        {diagnostic ? (
          <StatusMessage type={statusTone[diagnostic.state]} title={diagnostic.message} description={`Last checked ${checkedAt}; latency ${diagnostic.latencyMs} ms.`} />
        ) : (
          <StatusMessage type="info" title="Checking Soroban RPC" description="Waiting for the first selected-network diagnostic result." />
        )}
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Health", diagnostic?.health ?? "Unavailable"],
          ["Latest ledger", diagnostic?.latestLedger?.toLocaleString() ?? "Unavailable"],
          ["Protocol", diagnostic?.protocolVersion?.toString() ?? "Unavailable"],
          ["Freshness", diagnostic?.freshnessAvailable ? `${diagnostic.freshnessSeconds}s old` : "Unavailable"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-white/80 bg-white/70 p-3">
            <dt className="text-xs font-bold uppercase tracking-wide text-[#68758a]">{label}</dt>
            <dd className="mt-1 text-sm font-extrabold text-[#172033]">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
