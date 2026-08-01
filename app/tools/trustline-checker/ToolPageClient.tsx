"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AddressInput } from "@/components/stellar/AddressInput";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { checkTrustline } from "@/lib/stellar/trustline";

export default function TrustlineCheckerPage() {
  const { network } = useNetwork();
  const [account, setAccount] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const [issuer, setIssuer] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "info" as "info" | "success" | "warning" | "error", text: "The trust inspector needs an account, asset code, and issuer to look for the handshake." });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await checkTrustline(account, assetCode, issuer, network);
      setMessage({ type: result.exists ? "success" : "warning", text: result.message });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unexpected error." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CharacterPanel
        tone="trust"
        eyebrow="Trust inspector"
        title="Trustline Checker"
        description={`The inspector looks for a friendly handshake between an account and an issued asset on Stellar ${network}.`}
      />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AddressInput value={account} onChange={setAccount} label="Account address" />
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#29364d]">Asset code</span>
            <Input value={assetCode} onChange={(event) => setAssetCode(event.target.value)} placeholder="USDC" />
          </label>
          <AddressInput value={issuer} onChange={setIssuer} label="Issuer address" />
          <Button type="submit" disabled={loading}>
            {loading ? "Inspecting..." : "Inspect handshake"}
          </Button>
        </form>
      </Card>
      <StatusMessage type={message.type} title="Inspector report" description={message.text} />
      {message.type === "error" && message.text.includes("Account not found on Stellar testnet") ? (
        <StatusMessage
          type="info"
          title="Fund the testnet account first"
          description="A trustline can only be checked after the account exists on testnet."
          action={
            <Link
              href="/tools/testnet-faucet"
              className="inline-flex rounded-md border border-[#82cbe3]/80 bg-white/60 px-3 py-2 text-sm font-extrabold text-[#178fb5] hover:bg-[#e0f6ff]"
            >
              Open Testnet Faucet Helper
            </Link>
          }
        />
      ) : null}
    </div>
  );
}
