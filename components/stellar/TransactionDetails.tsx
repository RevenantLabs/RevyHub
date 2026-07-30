import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import { formatStroopsAsXLM } from "@/lib/stellar/assetAmount";
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
  operationCount?: number;
}

function formatFee(stroops: string) {
  // Reject anything that isn't a non-negative integer stroop count so we
  // keep the raw value visible rather than coercing through Number().
  const trimmed = stroops?.trim() ?? "";

  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return `${stroops} stroops`;
  }

  // The formatter trims trailing zeros by default and never converts
  // through Number(), so very large fee counts (close to int64) stay exact.
  const xlm = formatStroopsAsXLM(stroops);

  return `${stroops} stroops (${xlm} XLM)`;
}

export function TransactionDetails({ transaction }: { transaction: TransactionSummary }) {
  const rows = [
    ["Network", transaction.network],
    ["Hash", <CopyableValue key="hash" label="transaction hash" value={transaction.hash} visible={10} />],
    ["Ledger", String(transaction.ledger)],
    ["Source account", <CopyableValue key="source" label="source account" value={transaction.sourceAccount} />],
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
