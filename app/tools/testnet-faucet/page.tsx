"use client";

import { useMemo, useState } from "react";
import { Droplets, Loader2 } from "lucide-react";
import { AddressInput } from "@/components/stellar/AddressInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { TestnetOnlyNotice } from "@/components/stellar/TestnetOnlyNotice";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { getNetworkLabel } from "@/lib/stellar/horizon";
import { fundTestnetAccount } from "@/lib/stellar/friendbot";

export default function TestnetFaucetPage() {
  const { network } = useNetwork();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "info" as "info" | "success" | "warning" | "error", text: "The faucet helper pours testnet XLM only. No real funds are involved." });
  const testnetOnlyBlocked = network !== "testnet";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (testnetOnlyBlocked) {
      setMessage({
        type: "warning",
        text: `The faucet helper cannot pour while the app is set to ${getNetworkLabel(network)}. Switch to testnet to continue.`
      });
      return;
    }

    // TODO(issue #24): Add a shared async loading pattern for faucet, balance, and transaction tools.
    setLoading(true);
    setResult(null);

    const outcome = await fundTestnetAccount(address);
    setResult(outcome);
    setLoading(false);
  }

  function renderResultMessage() {
    if (loading) {
      return (
        <StatusMessage
          type="info"
          title="Pouring testnet XLM..."
          description="The faucet helper is sending a Friendbot request for this account."
        />
      );
    }

    if (!result) {
      return (
        <StatusMessage
          type="info"
          title="Faucet helper is ready"
          description="Enter a Stellar testnet public address and the faucet helper will pour XLM through Friendbot. No real funds are involved."
        />
      );
    }

    if (result.ok) {
      return (
        <div className="space-y-3">
          <StatusMessage
            type="success"
            title="Account funded"
            description="The faucet helper poured testnet XLM into this account."
          />
          <Card className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wide text-[#9a6754]">Funded account</span>
            </div>
            <CopyableValue label="public address" value={address} />
            {result.hash ? (
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wide text-[#9a6754]">Transaction</span>
                <CopyableValue label="transaction hash" value={result.hash} />
              </div>
            ) : null}
            {result.ledger > 0 ? (
              <p className="text-sm text-[#7f8ea3]">
                Recorded in ledger{" "}
                <span className="font-extrabold text-[#178fb5]">{result.ledger.toLocaleString()}</span>
              </p>
            ) : null}
          </Card>
        </div>
      );
    }

    // Error case
    return (
      <div className="space-y-3">
        <StatusMessage
          type="error"
          title="Faucet helper could not pour"
          description={result.message}
        />
        {result.detail ? (
          <StatusMessage
            type="info"
            title="What happened?"
            description={result.detail}
          />
        ) : null}
        {result.code === "ALREADY_FUNDED" ? (
          <StatusMessage
            type="warning"
            title="Already funded?"
            description="Try creating a fresh Stellar keypair or use the Balance Viewer to check existing funds."
          />
        ) : null}
        {result.code === "RATE_LIMITED" ? (
          <StatusMessage
            type="warning"
            title="Pouring too fast"
            description="Friendbot limits how quickly you can request testnet XLM. Wait about 60 seconds and try again."
          />
        ) : null}
        {result.code === "NETWORK_ERROR" ? (
          <StatusMessage
            type="warning"
            title="Network trouble"
            description="Check your internet connection. Friendbot (friendbot.stellar.org) may be temporarily unreachable."
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CharacterPanel
        tone="faucet"
        eyebrow="Faucet helper"
        title="Testnet Faucet Helper"
        description="The faucet helper pours harmless testnet XLM into a public account through Friendbot."
      />
      <TestnetOnlyNotice
        character="The faucet helper"
        reason="Friendbot resets often and testnet XLM has no market value."
      />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AddressInput value={address} onChange={setAddress} />
          <Button type="submit" disabled={loading || testnetOnlyBlocked}>
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
    </div>
  );
}
