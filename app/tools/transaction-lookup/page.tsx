"use client";

import { useEffect, useRef, useState } from "react";
import { TransactionDetails, type TransactionSummary } from "@/components/stellar/TransactionDetails";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { lookupTransaction } from "@/lib/stellar/transaction";
import { isCancelledError } from "@/lib/stellar/horizon";

export default function TransactionLookupPage() {
  const { network } = useNetwork();
  const formRef = useRef<HTMLFormElement>(null);
  const [hash, setHash] = useState("");
  const [transaction, setTransaction] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "info" as "info" | "success" | "error", text: "The detective comet needs a transaction hash to follow the trail on the selected network." });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      const controller = abortRef.current;
      abortRef.current = null;
      controller?.abort();
    };
  }, []);

  function handleReset() {
    setHash("");
    setTransaction(null);
    setLoading(false);
    setMessage({ type: "info", text: "The detective comet needs a testnet transaction hash to follow the trail." });
    formRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setTransaction(null);

    try {
      const result = await lookupTransaction(hash, network, controller.signal);
      if (abortRef.current !== controller) return;
      setTransaction(result);
      setMessage({ type: "success", text: `The detective comet found the transaction in ${network} Horizon.` });
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
        tone="detective"
        eyebrow="Detective comet"
        title="Transaction Lookup"
        description={`The detective comet follows a transaction hash through Stellar ${network} Horizon and brings back the important clues.`}
      />
      <Card>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#29364d]">Transaction hash</span>
            <Input value={hash} onChange={(event) => setHash(event.target.value)} placeholder="64 character hash" spellCheck={false} />
          </label>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Following trail..." : "Follow transaction trail"}
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset}>Reset</Button>
          </div>
        </form>
      </Card>
      <StatusMessage type={message.type} title="Detective report" description={message.text} />
      {loading ? (
        <div className="space-y-3" aria-label="Loading transaction details" role="status">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <dl className="divide-y divide-[#c7d6e8] rounded-lg border border-white/80 bg-white/68">
            {["Network", "Hash", "Ledger", "Source", "Fee", "Created", "Ops"].map((label) => (
              <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-48 sm:col-span-2" />
              </div>
            ))}
          </dl>
          <span className="sr-only">Loading transaction data from Horizon...</span>
        </div>
      ) : null}
      {transaction ? <TransactionDetails transaction={transaction} /> : null}
    </div>
  );
}
