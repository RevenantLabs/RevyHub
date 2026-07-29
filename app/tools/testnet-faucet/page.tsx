"use client";

import { useMemo, useState } from "react";
import { Droplets, Loader2 } from "lucide-react";
import { AddressInput } from "@/components/stellar/AddressInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import { fundTestnetAccount, type FriendbotResult } from "@/lib/stellar/friendbot";
import { validatePublicKey } from "@/lib/stellar/validateAddress";

export default function TestnetFaucetPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FriendbotResult | null>(null);
  const hasInput = address.trim().length > 0;
  const validation = useMemo(() => (hasInput ? validatePublicKey(address) : null), [address, hasInput]);
  const isInvalidAddress = hasInput && validation !== null && !validation.valid;
  const isSubmitDisabled = loading || !hasInput || isInvalidAddress;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-[#ffc3a8]/80 bg-[#fff2e9] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#9a513f]">
          <Droplets className="h-3.5 w-3.5" aria-hidden />
          Testnet only &mdash; no real value
        </span>
      </CharacterPanel>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AddressInput value={address} onChange={setAddress} />
          {isInvalidAddress ? (
            <StatusMessage
              type="error"
              title="Cannot pour to this address"
              description={validation.message}
            />
          ) : null}
          <Button type="submit" disabled={isSubmitDisabled}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Pouring...
              </>
            ) : (
              <>
                <Droplets className="h-4 w-4" aria-hidden />
                Ask faucet helper to fund
              </>
            )}
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
