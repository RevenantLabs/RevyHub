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
  const formRef = useRef<HTMLFormElement>(null);
  const [address, setAddress] = useState("");
  const [balances, setBalances] = useState<DisplayBalance[]>([]);
  const [message, setMessage] = useState<{ type: "info" | "success" | "error"; text: string }>({
    type: "info",
    text: "The moon wallet is waiting for a funded account address on the selected network."
  });
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      const controller = abortRef.current;
      abortRef.current = null;
      controller?.abort();
    };
  }, []);

  function handleReset() {
    setAddress("");
    setBalances([]);
    setMessage({ type: "info", text: "The moon wallet is waiting for a funded testnet account address." });
    setLoading(false);
    formRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setBalances([]);

    try {
      const nextBalances = await getAccountBalances(address, network, controller.signal);
      if (abortRef.current !== controller) return;
      setBalances(nextBalances);
      setMessage({ type: "success", text: `The moon wallet opened and counted balances from ${network} Horizon.` });
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
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <AddressInput value={address} onChange={setAddress} />
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Counting..." : "Open moon wallet"}
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset}>Reset</Button>
          </div>
        </form>
      </Card>
      <StatusMessage type={message.type} title={message.type === "success" ? "Wallet opened" : "Moon wallet status"} description={message.text} />
      {network === "testnet" && message.type === "error" && message.text.includes("Account not found") ? (
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
