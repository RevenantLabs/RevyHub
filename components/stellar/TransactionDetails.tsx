import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import type { StellarNetwork } from "@/lib/stellar/horizon";

const explorerBaseUrls: Record<StellarNetwork, string> = {
  testnet: "https://stellar.expert/explorer/testnet/tx",
  mainnet: "https://stellar.expert/explorer/public/tx"
};

export type TransactionMemoType = "none" | "text" | "id" | "hash" | "return";

export interface TransactionMemo {
  type: TransactionMemoType;
  value: string | null;
}

export interface TransactionSummary {
  hash: string;
  ledger: number;
  sourceAccount: string;
  feeCharged: string;
  createdAt: string;
  successful: boolean;
  network: StellarNetwork;
  operationCount?: number;
  memo: TransactionMemo;
}

export function formatMemoTypeLabel(type: TransactionMemoType) {
  switch (type) {
    case "none":
      return "None";
    case "text":
      return "Text";
    case "id":
      return "ID";
    case "hash":
      return "Hash";
    case "return":
      return "Return hash";
  }
}

export function formatMemoValueLabel(memo: TransactionMemo) {
  if (memo.type === "none" || memo.value === null) {
    return "No memo attached";
  }

  return memo.value;
}

export function shouldUseCopyableMemoValue(type: TransactionMemoType) {
  return type === "hash" || type === "return";
}

function formatFee(stroops: string) {
  const fee = Number(stroops);

  if (!Number.isFinite(fee)) {
    return `${stroops} stroops`;
  }

  return `${fee} stroops (${(fee / 10_000_000).toFixed(7)} XLM)`;
}

function renderMemoValue(memo: TransactionMemo) {
  if (memo.type === "none" || memo.value === null) {
    return formatMemoValueLabel(memo);
  }

  if (shouldUseCopyableMemoValue(memo.type)) {
    return <CopyableValue key="memo" label="transaction memo" value={memo.value} visible={10} />;
  }

  return formatMemoValueLabel(memo);
}

export function TransactionDetails({ transaction }: { transaction: TransactionSummary }) {
  const memoValue = renderMemoValue(transaction.memo);
  const rows = [
    ["Network", transaction.network],
    ["Hash", <CopyableValue key="hash" label="transaction hash" value={transaction.hash} visible={10} />],
    ["Ledger", String(transaction.ledger)],
    ["Source account", <CopyableValue key="source" label="source account" value={transaction.sourceAccount} />],
    ["Memo type", formatMemoTypeLabel(transaction.memo.type)],
    ["Memo", memoValue],
    ["Fee charged", formatFee(transaction.feeCharged)],
    ["Created at", new Date(transaction.createdAt).toLocaleString()],
    ["Operations", String(transaction.operationCount ?? "Not loaded")]
  ] as const;
  const explorerUrl = `${explorerBaseUrls[transaction.network]}/${transaction.hash}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#172033]">Transaction result</p>
        <Badge tone={transaction.successful ? "success" : "warning"}>
          {transaction.successful ? "Successful" : "Failed"}
        </Badge>
      </div>
      <dl className="divide-y divide-[#c7d6e8] rounded-lg border border-white/80 bg-white/68">
        {rows.map(([label, value]) => (
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
        Open in Stellar Expert
      </a>
    </div>
  );
}
