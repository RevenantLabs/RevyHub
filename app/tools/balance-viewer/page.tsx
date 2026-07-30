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
import { getAccountBalances, getMinimumBalance, type MinimumBalanceEstimate } from "@/lib/stellar/account";
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
  const [loading, setLoading] = useState(false);
  const [minBalance, setMinBalance] = useState<MinimumBalanceEstimate | null>(null);
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
    setMinBalance(null);

    try {
      const [nextBalances, estimate] = await Promise.all([
        getAccountBalances(address, network),
        getMinimumBalance(address, network)
      ]);
      const nextBalances = await getAccountBalances(address, network, controller.signal);
      if (abortRef.current !== controller) return;
      setBalances(nextBalances);
      setMinBalance(estimate);
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
        <form onSubmit={handleSubmit} className="space-y-5">
          <AddressInput value={address} onChange={setAddress} />
          <Button type="submit" disabled={loading}>
            {loading ? "Counting..." : "Open moon wallet"}
          </Button>
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
      {minBalance ? (
        <Card>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-[#68758a]">
                Minimum Balance Estimate
              </p>
              <p className="mt-1 text-xs text-[#68758a]">
                {minBalance.lastModifiedLedger > 0
                  ? <>Data from ledger #{minBalance.lastModifiedLedger} &middot; Base reserve: {minBalance.baseReserve} XLM</>
                  : <>Base reserve: {minBalance.baseReserve} XLM</>
                }
              </p>
            </div>

            <div className="rounded-lg bg-white/50 p-4">
              <p className="font-mono text-sm font-semibold text-[#172033]">{minBalance.formula}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[#b6e5d8]/60 bg-[#d9f5ee]/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#3a7c6b]">
                  Minimum Required
                </p>
                <p className="mt-1 text-lg font-extrabold text-[#172033]">{minBalance.minimumBalance} XLM</p>
              </div>
              <div className="rounded-lg border border-[#82cbe3]/60 bg-[#e0f6ff]/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#178fb5]">
                  Native Balance
                </p>
                <p className="mt-1 text-lg font-extrabold text-[#172033]">{minBalance.nativeBalance} XLM</p>
              </div>
              <div className="rounded-lg border border-[#f4d48c]/60 bg-[#fef9e7]/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9a7d2e]">
                  Potentially Spendable
                </p>
                <p className="mt-1 text-lg font-extrabold text-[#172033]">{minBalance.potentiallySpendable} XLM</p>
                <p className="mt-1 text-[10px] leading-tight text-[#68758a]">
                  This is an estimate, not transaction advice. Actual spendable balance depends on network conditions.
                </p>
              </div>
            </div>

            <details className="text-xs text-[#68758a]">
              <summary className="cursor-pointer font-semibold">How is this calculated?</summary>
              <div className="mt-2 space-y-1">
                <p>
                  Stellar requires a minimum balance of <strong>base reserve × 2</strong> for the account itself.
                </p>
                <p>
                  Each subentry (trustline, offer, data entry, signer) adds <strong>1 × base reserve</strong>.
                </p>
                <p>
                  Sponsoring entries for others adds reserve obligations; entries sponsored by others relieve them.
                </p>
                <p className="mt-2">
                  Subentries: {minBalance.subentryCount} &middot; Sponsoring: {minBalance.numSponsoring} &middot;
                  Sponsored: {minBalance.numSponsored} &middot; Base reserve: {minBalance.baseReserve} XLM
                </p>
              </div>
            </details>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
