"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TransactionDetails, type TransactionSummary } from "@/components/stellar/TransactionDetails";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { lookupTransaction } from "@/lib/stellar/transaction";

// Shareable link parameter (see docs/ISSUES.md #38): ?hash=<transaction hash>
// Prefills the hash field only; a lookup still requires an explicit form submit.
const MAX_HASH_PARAM_LENGTH = 100;
const PRINTABLE_ASCII = /^[\x20-\x7E]*$/;

export function sanitizeHashParam(raw: string | null): string | null {
  if (raw === null) {
    return null;
  }

  const value = raw.trim();

  if (!value || value.length > MAX_HASH_PARAM_LENGTH || !PRINTABLE_ASCII.test(value)) {
    return null;
  }

  return value;
}

function TransactionLookupContent() {
  const { network } = useNetwork();
  const searchParams = useSearchParams();
  const rawHashParam = searchParams.get("hash");
  const [hash, setHash] = useState(() => sanitizeHashParam(rawHashParam) ?? "");
  const [paramIgnored] = useState(
    () => rawHashParam !== null && sanitizeHashParam(rawHashParam) === null
  );
  const [transaction, setTransaction] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "info" as "info" | "success" | "error", text: "The detective comet needs a testnet transaction hash to follow the trail." });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setTransaction(null);

    try {
      const result = await lookupTransaction(hash, network);
      setTransaction(result);
      setMessage({ type: "success", text: `The detective comet found the transaction in ${network} Horizon.` });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unexpected error." });
    } finally {
      setLoading(false);
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
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#29364d]">Transaction hash</span>
            <Input
              value={hash}
              onChange={(event) => setHash(event.target.value)}
              placeholder="64 character hash"
              spellCheck={false}
              maxLength={MAX_HASH_PARAM_LENGTH}
            />
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? "Following trail..." : "Follow transaction trail"}
          </Button>
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

export default function TransactionLookupPage() {
  return (
    <Suspense fallback={null}>
      <TransactionLookupContent />
    </Suspense>
  );
}
