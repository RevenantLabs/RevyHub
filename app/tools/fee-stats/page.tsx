"use client";

import { useCallback, useRef, useState } from "react";
import { FeeStatsPanel } from "@/components/stellar/FeeStatsPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { getFeeStats, type FeeStatsSummary } from "@/lib/stellar/feeStats";

export default function FeeStatsPage() {
  const { network } = useNetwork();
  const [stats, setStats] = useState<FeeStatsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ network: typeof network; text: string } | null>(null);
  const loadingRef = useRef(false);

  const loadFeeStats = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      const result = await getFeeStats(network);
      setStats(result);
      setError(null);
    } catch (fetchError) {
      setError({
        network,
        text: fetchError instanceof Error ? fetchError.message : "Unexpected error."
      });
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [network]);

  // Stats fetched for a previously selected network are stale once the user switches networks.
  const displayedStats = stats && stats.network === network ? stats : null;
  const displayedError = error?.network === network ? error.text : null;
  const message = displayedError
    ? { type: "error" as const, text: displayedError }
    : displayedStats
      ? { type: "success" as const, text: `The gauge gremlin read fresh fee stats from ${network} Horizon.` }
      : { type: "info" as const, text: `The gauge gremlin waits for a click before checking ${network} network fees.` };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <CharacterPanel
        tone="gauge"
        eyebrow="Gauge gremlin"
        title="Network Fee Statistics"
        description={`The gauge gremlin checks Stellar ${network} Horizon for current fee-market conditions, on demand.`}
      />
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#172033]">Fee statistics</p>
          <p className="text-xs text-[#5d6b82]">
            {displayedStats
              ? `Last updated ${new Date(displayedStats.fetchedAt).toLocaleString()}`
              : "Not loaded yet"}
          </p>
        </div>
        <Button onClick={loadFeeStats} disabled={loading}>
          {loading ? "Checking fees..." : displayedStats ? "Refresh fee stats" : "Load fee stats"}
        </Button>
      </Card>
      <StatusMessage type={message.type} title="Gauge report" description={message.text} />
      {displayedStats ? <FeeStatsPanel stats={displayedStats} /> : null}
    </div>
  );
}
