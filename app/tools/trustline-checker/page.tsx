"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AddressInput } from "@/components/stellar/AddressInput";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { checkTrustline } from "@/lib/stellar/trustline";
import { isCancelledError } from "@/lib/stellar/horizon";

export default function TrustlineCheckerPage() {
  const { network } = useNetwork();
  const [account, setAccount] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const [issuer, setIssuer] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "info" as "info" | "success" | "warning" | "error", text: "The trust inspector needs an account, asset code, and issuer to look for the handshake." });
  const [notFound, setNotFound] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      const controller = abortRef.current;
      abortRef.current = null;
      controller?.abort();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setNotFound(false);

    try {
      const result = await checkTrustline(account, assetCode, issuer, network, controller.signal);

      if (abortRef.current !== controller) return;

      if (result.notFound) {
        setNotFound(true);
        setMessage({ type: "info", text: "The trust inspector could not find this account on the network." });
      } else {
        setMessage({ type: result.exists ? "success" : "warning", text: result.message });
      }
    } catch (error) {
      if (isCancelledError(error) || abortRef.current !== controller) return;
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unexpected error." });
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
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
      {notFound && network === "testnet" ? (
        <StatusMessage
          type="info"
          title="This account is a ghost on testnet"
          description="Every testnet account needs to receive testnet XLM before it can appear on Horizon. This keeps the testnet safe from spam and helps you practice without real funds."
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
      {notFound && network === "mainnet" ? (
        <StatusMessage
          type="info"
          title="This account does not exist on mainnet"
          description="Every account on Stellar mainnet must be created and funded before it can appear on Horizon."
        />
      ) : null}
    </div>
  );
}