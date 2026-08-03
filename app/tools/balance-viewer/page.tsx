"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AddressInput } from "@/components/stellar/AddressInput";
import { BalanceList, type DisplayBalance } from "@/components/stellar/BalanceList";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { getAccountBalances } from "@/lib/stellar/account";
import { isCancelledError } from "@/lib/stellar/horizon";

export default function BalanceViewerPage() {
  const { network } = useNetwork();
  const [address, setAddress] = useState("");
  const [balances, setBalances] = useState<DisplayBalance[]>([]);
  const [message, setMessage] = useState<{ type: "info" | "success" | "error"; text: string }>({
    type: "info",
    text: "The moon wallet is waiting for a funded account address on the selected network."
  });
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setBalances([]);
    setNotFound(false);

    try {
      const result = await getAccountBalances(address, network, controller.signal);

      if (abortRef.current !== controller) return;

      if (!result.found) {
        setNotFound(true);
        setMessage({ type: "info", text: "The moon wallet could not find this account." });
      } else {
        setBalances(result.balances);
        setMessage({ type: "success", text: `The moon wallet opened and counted balances from ${network} Horizon.` });
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
      {loading ? (
        <div className="space-y-3" aria-label="Loading balances" role="status">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-white/80 bg-white/68 p-4 shadow-[4px_4px_0_rgba(142,220,244,0.22)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
          <span className="sr-only">Loading balance data from Horizon...</span>
        </div>
      ) : null}
      {balances.length > 0 ? <BalanceList balances={balances} /> : null}
    </div>
  );
}