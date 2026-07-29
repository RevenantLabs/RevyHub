"use client";

import { useState } from "react";
import { AddressInput } from "@/components/stellar/AddressInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { fundTestnetAccount } from "@/lib/stellar/friendbot";

export default function TestnetFaucetPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "info" as "info" | "success" | "warning" | "error", text: "The faucet helper pours testnet XLM only. No real funds are involved." });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await fundTestnetAccount(address);
      setMessage({ type: "success", text: "The faucet helper sent the Friendbot request for this testnet account." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unexpected error." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CharacterPanel
        tone="faucet"
        eyebrow="Faucet helper"
        title="Testnet Faucet Helper"
        description="The faucet helper pours harmless testnet XLM into a public account through Friendbot."
      />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AddressInput value={address} onChange={setAddress} />
          <Button type="submit" disabled={loading}>
            {loading ? "Pouring..." : "Ask faucet helper to fund"}
          </Button>
        </form>
      </Card>
      {loading ? (
        <div aria-label="Funding in progress" role="status">
          <div className="flex gap-3 rounded-lg border border-white/80 bg-white/68 p-4 shadow-[4px_4px_0_rgba(142,220,244,0.22)]">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
          <span className="sr-only">Faucet helper is processing your request...</span>
        </div>
      ) : (
        <StatusMessage type={message.type} title="Faucet helper status" description={message.text} />
      )}
      <StatusMessage type="warning" title="Testnet only" description="Friendbot resets and testnet XLM have no market value." />
    </div>
  );
}
