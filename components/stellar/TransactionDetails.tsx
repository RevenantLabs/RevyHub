"use client";

import { useState } from "react";
import { ChevronDown, Copy } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import { copyText } from "@/lib/copy";
import type { StellarNetwork } from "@/lib/stellar/horizon";
import type { RawTransactionData } from "@/lib/stellar/transaction";

const explorerBaseUrls: Record<StellarNetwork, string> = {
  testnet: "https://stellar.expert/explorer/testnet/tx",
  mainnet: "https://stellar.expert/explorer/public/tx"
};

export interface TransactionSummary {
  hash: string;
  ledger: number;
  sourceAccount: string;
  feeCharged: string;
  createdAt: string;
  successful: boolean;
  network: StellarNetwork;
  operationCount?: number;
  raw?: RawTransactionData;
  operationCount: number;
  memo?: { type: string; value: string };
}

function formatFee(stroops: string) {
  const fee = Number(stroops);

  if (!Number.isFinite(fee)) {
    return `${stroops} stroops`;
  }

  return `${fee} stroops (${(fee / 10_000_000).toFixed(7)} XLM)`;
}

function RawTransactionPanel({ raw }: { raw: RawTransactionData }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const rows: [string, string][] = [
    ["Paging token", raw.pagingToken],
    ["Envelope XDR", raw.envelopeXdr],
    ["Result XDR", raw.resultXdr],
    ...(raw.resultMetaXdr ? [["Result meta XDR", raw.resultMetaXdr] as [string, string]] : []),
    ...(raw.feeMetaXdr ? [["Fee meta XDR", raw.feeMetaXdr] as [string, string]] : []),
    ["Max fee", raw.maxFee],
    ...(raw.feeAccount ? [["Fee account", raw.feeAccount] as [string, string]] : []),
  ];

  const jsonString = JSON.stringify(raw, null, 2);

  async function handleCopyJson() {
    try {
      await copyText(jsonString);
      setCopied(true);
      setCopyError(null);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopyError("Failed to copy to clipboard");
    }
  }

  return (
    <details className="group rounded-lg border border-white/80 bg-white/68">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-[#172033]">
        <ChevronDown
          className="h-4 w-4 -rotate-90 transition-transform group-open:rotate-0"
          aria-hidden
        />
        Raw Transaction Data
      </summary>
      <div className="border-t border-[#c7d6e8]">
        <dl className="divide-y divide-[#c7d6e8]">
          {rows.map(([label, value]) => (
            <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
              <dt className="text-xs uppercase tracking-wide text-[#68758a]">{label}</dt>
              <dd className="break-all text-sm text-[#29364d] sm:col-span-2">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center gap-3 border-t border-[#c7d6e8] px-4 py-3">
          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-[#d9f4ff] px-3 py-2 text-sm font-extrabold text-[#172033] shadow-[4px_4px_0_rgba(199,185,243,0.55)] transition hover:bg-[#c5edff]"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden />
            {copied ? "Copied!" : "Copy JSON"}
          </button>
          {copyError && (
            <p className="text-xs text-[#ec5d55]" role="alert">
              {copyError}
            </p>
          )}
        </div>
      </div>
    </details>
  );
function formatMemo(memo: { type: string; value: string }) {
  return `${memo.value} (${memo.type})`;
}

export function TransactionDetails({ transaction }: { transaction: TransactionSummary }) {
  const baseRows: [string, ReactNode][] = [
    ["Status", <Badge key="status" tone={transaction.successful ? "success" : "warning"}>{transaction.successful ? "Successful" : "Failed"}</Badge>],
    ["Network", transaction.network],
    ["Hash", <CopyableValue key="hash" label="transaction hash" value={transaction.hash} visible={10} />],
    ["Ledger", String(transaction.ledger)],
    ["Source account", <CopyableValue key="source" label="source account" value={transaction.sourceAccount} />],
    ["Fee charged", formatFee(transaction.feeCharged)],
    ["Operations", String(transaction.operationCount)],
    ["Created at", new Date(transaction.createdAt).toLocaleString()]
  ];

  if (transaction.memo) {
    baseRows.push(["Memo", formatMemo(transaction.memo)]);
  }

  const explorerUrl = `${explorerBaseUrls[transaction.network]}/${transaction.hash}`;

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#172033]">Transaction result</p>
      <dl className="divide-y divide-[#c7d6e8] rounded-lg border border-white/80 bg-white/68">
        {baseRows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
            <dt className="text-xs uppercase tracking-wide text-[#68758a]">{label}</dt>
            <dd className="break-words text-sm text-[#29364d] sm:col-span-2">{value}</dd>
          </div>
        ))}
      </dl>
      {transaction.raw && <RawTransactionPanel raw={transaction.raw} />}
      <a
        href={explorerUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex rounded-md border border-[#82cbe3]/80 bg-white/60 px-3 py-2 text-sm font-extrabold text-[#178fb5] hover:bg-[#e0f6ff]"
      >
        Open in Stellar Expert ↗
      </a>
    </div>
  );
}
