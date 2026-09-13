"use client";

import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { SorobanHealthPanel } from "@/components/stellar/SorobanHealthPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { useNetwork } from "@/components/stellar/NetworkProvider";

export default function SorobanHealthPage() {
  const { network } = useNetwork();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <CharacterPanel
        tone="star"
        eyebrow="Star engineer"
        title="Soroban RPC Health"
        description={`A star engineer checks Soroban RPC health, latest ledger state, and response times on ${network}. When Soroban workflows fail unexpectedly, this diagnostic helps isolate endpoint and ledger-ingestion problems.`}
      />

      <SorobanHealthPanel network={network} />

      <StatusMessage
        type="info"
        title="About Soroban RPC"
        description="Soroban smart-contract workflows require a healthy RPC endpoint separate from Horizon. This tool checks getHealth and getLatestLedger JSON-RPC methods to verify that the endpoint is reachable, responding, and ingesting ledgers within expected time windows."
      />
    </div>
  );
}
