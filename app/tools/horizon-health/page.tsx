"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { checkHorizonHealth, type HorizonHealthResult } from "@/lib/stellar/horizonHealth";

const STATUS_PRESENTATION: Record<HorizonHealthResult["status"], { type: "success" | "warning" | "error"; title: string }> = {
  healthy: { type: "success", title: "Horizon is healthy" },
  "stale-ledger": { type: "warning", title: "Ledger looks stale" },
  "wrong-network": { type: "warning", title: "Unexpected network identity" },
  timeout: { type: "error", title: "Horizon request timed out" },
  "network-error": { type: "error", title: "Could not reach Horizon" },
  "malformed-response": { type: "error", title: "Unexpected Horizon response" }
};

export default function HorizonHealthPage() {
  const { network } = useNetwork();
  const [result, setResult] = useState<HorizonHealthResult | null>(null);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, []);

  async function handleCheck() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setResult(null);

    try {
      const health = await checkHorizonHealth(network, { signal: controller.signal });

      if (controllerRef.current === controller) {
        setResult(health);
      }
    } catch {
      // A superseded or unmounted check aborts here; there is nothing stale to show.
    } finally {
      if (controllerRef.current === controller) {
        setLoading(false);
      }
    }
  }

  const presentation = result ? STATUS_PRESENTATION[result.status] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CharacterPanel
        tone="detective"
        eyebrow="Detective comet"
        title="Horizon Health Diagnostic"
        description={`The detective comet pings the configured Stellar ${network} Horizon endpoint on request and reports what it finds.`}
      />
      <Card className="space-y-5">
        <Button type="button" onClick={handleCheck} disabled={loading}>
          {loading ? "Checking Horizon..." : "Check Horizon"}
        </Button>
        {presentation ? (
          <StatusMessage type={presentation.type} title={presentation.title} description={result?.message} />
        ) : (
          <StatusMessage
            type="info"
            title="No check run yet"
            description="Click Check Horizon to test reachability, latency, and network identity for the selected network. Nothing is requested automatically."
          />
        )}
        {result ? (
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            {result.latencyMs !== undefined ? (
              <div>
                <dt className="font-medium text-[#29364d]">Latency</dt>
                <dd className="text-[#4e5c73]">{result.latencyMs}ms</dd>
              </div>
            ) : null}
            {result.horizonVersion !== undefined ? (
              <div>
                <dt className="font-medium text-[#29364d]">Horizon version</dt>
                <dd className="text-[#4e5c73]">{result.horizonVersion}</dd>
              </div>
            ) : null}
            {result.networkPassphrase !== undefined ? (
              <div>
                <dt className="font-medium text-[#29364d]">Network passphrase</dt>
                <dd className="break-words text-[#4e5c73]">{result.networkPassphrase}</dd>
              </div>
            ) : null}
            {result.expectedNetworkPassphrase !== undefined ? (
              <div>
                <dt className="font-medium text-[#29364d]">Expected passphrase</dt>
                <dd className="break-words text-[#4e5c73]">{result.expectedNetworkPassphrase}</dd>
              </div>
            ) : null}
            {result.currentLedger !== undefined ? (
              <div>
                <dt className="font-medium text-[#29364d]">Current ledger</dt>
                <dd className="text-[#4e5c73]">{result.currentLedger}</dd>
              </div>
            ) : null}
            {result.ledgerAgeSeconds !== undefined ? (
              <div>
                <dt className="font-medium text-[#29364d]">Ledger age</dt>
                <dd className="text-[#4e5c73]">{Math.round(result.ledgerAgeSeconds)}s</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </Card>
    </div>
  );
}
