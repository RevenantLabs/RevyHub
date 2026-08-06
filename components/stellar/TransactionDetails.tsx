import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import type { StellarNetwork } from "@/lib/stellar/horizon";

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
