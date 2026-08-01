"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AddressInput } from "@/components/stellar/AddressInput";
import { BalanceList, type DisplayBalance } from "@/components/stellar/BalanceList";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { getAccountBalances } from "@/lib/stellar/account";

export default function BalanceViewerPage() {
  const { network } = useNetwork();
  const [address, setAddress] = useState("");
  const [balances, setBalances] = useState<DisplayBalance[]>([]);
  const [message, setMessage] = useState<{ type: "info" | "success" | "error"; text: string }>({
    type: "info",
    text: "The moon wallet is waiting for a funded testnet account address."
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO(issue #24): Replace button-only loading feedback with skeleton rows and preserved layout height.
    setLoading(true);
    setBalances([]);

    try {
      const nextBalances = await getAccountBalances(address, network);
      setBalances(nextBalances);
      setMessage({ type: "success", text: `The moon wallet opened and counted balances from ${network} Horizon.` });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unexpected error." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <CharacterPanel
        tone="moon"
        eyebrow="Moon wallet"
        title="Balance Viewer"
        description={`The moon wallet opens its pockets and shows native XLM plus issued assets from Stellar ${network} Horizon.`}
      />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AddressInput value={address} onChange={setAddress} />
          <Button type="submit" disabled={loading}>
            {loading ? "Counting..." : "Open moon wallet"}
          </Button>
        </form>
      </Card>
      <StatusMessage type={message.type} title={message.type === "success" ? "Wallet opened" : "Moon wallet status"} description={message.text} />
      {message.type === "error" && message.text.includes("Account not found on Stellar testnet") ? (
        <StatusMessage
          type="info"
          title="Create the testnet account"
          description="Testnet accounts only exist after they receive testnet XLM."
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
      {balances.length > 0 ? <BalanceList balances={balances} /> : null}
    </div>
  );
}
