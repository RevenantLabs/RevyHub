"use client";

import { useState } from "react";
import { AddressInput } from "@/components/stellar/AddressInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { fundTestnetAccount } from "@/lib/stellar/friendbot";

export default function TestnetFaucetPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "info" as "info" | "success" | "warning" | "error", text: "The faucet helper pours testnet XLM only. No real funds are involved." });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO(issue #24): Add a shared async loading pattern for faucet, balance, and transaction tools.
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
      <StatusMessage type={message.type} title="Faucet helper status" description={message.text} />
      <StatusMessage type="warning" title="Testnet only" description="Friendbot resets and testnet XLM have no market value." />
    </div>
  );
}
