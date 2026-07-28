"use client";

import { useRef, useState } from "react";
import { TransactionDetails, type TransactionSummary } from "@/components/stellar/TransactionDetails";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Input } from "@/components/ui/Input";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { lookupTransaction } from "@/lib/stellar/transaction";
import { isTransientError } from "@/lib/stellar/errors";

export default function TransactionLookupPage() {
  const { network } = useNetwork();
  const [hash, setHash] = useState("");
  const [transaction, setTransaction] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "info" as "info" | "success" | "error", text: "The detective comet needs a testnet transaction hash to follow the trail." });
  const [showRetry, setShowRetry] = useState(false);

  // Capture the last submitted hash so Retry can replay without requiring
  // the user to re-enter valid input.
  const lastHash = useRef<string>("");

  async function fetchTransaction(targetHash: string) {
    // TODO(issue #24): Add skeleton loading for transaction detail rows while Horizon responds.
    setLoading(true);
    setTransaction(null);
    setShowRetry(false);

    try {
      const result = await lookupTransaction(targetHash, network);
      setTransaction(result);
      setMessage({ type: "success", text: `The detective comet found the transaction in ${network} Horizon.` });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unexpected error." });
      setShowRetry(isTransientError(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    lastHash.current = hash;
    await fetchTransaction(hash);
  }

  async function handleRetry() {
    await fetchTransaction(lastHash.current);
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
            <Input value={hash} onChange={(event) => setHash(event.target.value)} placeholder="64 character hash" spellCheck={false} />
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? "Following trail..." : "Follow transaction trail"}
          </Button>
        </form>
      </Card>
      <StatusMessage
        type={message.type}
        title="Detective report"
        description={message.text}
        action={
          showRetry ? (
            <Button variant="secondary" disabled={loading} onClick={handleRetry} type="button">
              {loading ? "Retrying..." : "Retry"}
            </Button>
          ) : undefined
        }
      />
      {transaction ? <TransactionDetails transaction={transaction} /> : null}
    </div>
  );
}
