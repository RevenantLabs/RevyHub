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
import { checkTrustline, USDC_TRUSTLINE_PRESETS } from "@/lib/stellar/trustline";

type TrustlinePresetSelection = "custom" | "usdc";

export default function TrustlineCheckerPage() {
  const { network } = useNetwork();
  const [account, setAccount] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const [issuer, setIssuer] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<TrustlinePresetSelection>("custom");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "info" as "info" | "success" | "warning" | "error", text: "The trust inspector needs an account, asset code, and issuer to look for the handshake." });
  const activePreset = selectedPreset === "usdc" ? USDC_TRUSTLINE_PRESETS[network] : null;
  const resolvedAssetCode = activePreset?.assetCode ?? assetCode;
  const resolvedIssuer = activePreset?.issuerAddress ?? issuer;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await checkTrustline(account, resolvedAssetCode, resolvedIssuer, network);
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
            <span className="text-sm font-medium text-[#29364d]">Asset preset</span>
            <select
              value={selectedPreset}
              onChange={(event) => setSelectedPreset(event.target.value as TrustlinePresetSelection)}
              className="min-h-12 w-full rounded-md border border-[#c7d6e8] bg-white/78 px-4 text-sm text-[#172033] outline-none transition focus:border-[#47a8c7] focus:ring-2 focus:ring-[#8edcf4]/35"
            >
              <option value="custom">Custom issued asset</option>
              <option value="usdc">USDC by Circle ({network})</option>
            </select>
          </label>
          {activePreset ? (
            <div className="rounded-lg border border-[#82cbe3]/65 bg-[#e0f6ff]/70 px-4 py-3 text-sm text-[#4e5c73]">
              <span className="font-extrabold text-[#146783]">Inspector shortcut:</span>{" "}
              the verified Circle USDC asset for Stellar {network} is ready below. Switch the app network to inspect the other USDC asset.
            </div>
          ) : null}
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#29364d]">Asset code</span>
            <Input
              value={resolvedAssetCode}
              onChange={(event) => setAssetCode(event.target.value)}
              placeholder="USDC"
              readOnly={Boolean(activePreset)}
              className={activePreset ? "bg-[#f4f9fc] text-[#516078]" : undefined}
            />
          </label>
          <AddressInput
            value={resolvedIssuer}
            onChange={setIssuer}
            label="Issuer address"
            readOnly={Boolean(activePreset)}
          />
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
