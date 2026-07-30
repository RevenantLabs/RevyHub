import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import type { StellarNetwork } from "@/lib/stellar/horizon";
import { explainResultCode, type ResultCodeExplanation } from "@/lib/stellar/resultCodes";

const explorerBaseUrls: Record<StellarNetwork, string> = {
  testnet: "https://stellar.expert/explorer/testnet/tx",
  mainnet: "https://stellar.expert/explorer/public/tx"
};

export interface TransactionResultCodes {
  transaction?: string;
  operations?: string[];
}

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
  resultCodes?: TransactionResultCodes;
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

function ResultCodeExplanationCard({ explanation }: { explanation: ResultCodeExplanation }) {
  return (
    <div
      className={`rounded-md border px-3 py-2 text-sm ${
        explanation.recognized
          ? "border-[#e3b341]/60 bg-[#fff8e6] text-[#5b4600]"
          : "border-[#c7d6e8] bg-white/60 text-[#29364d]"
      }`}
    >
      <p className="font-semibold">
        {explanation.code} — {explanation.title}
      </p>
      <p>{explanation.explanation}</p>
      <p className="mt-1 text-xs italic">{explanation.hint}</p>
    </div>
  );
}

function ResultCodesSection({ resultCodes }: { resultCodes: TransactionResultCodes }) {
  if (!resultCodes.transaction && !resultCodes.operations?.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[#172033]">Result codes</p>
      {resultCodes.transaction ? (
        <ResultCodeExplanationCard explanation={explainResultCode(resultCodes.transaction, "transaction")} />
      ) : null}
      {resultCodes.operations?.map((code, index) => (
        <ResultCodeExplanationCard key={`${code}-${index}`} explanation={explainResultCode(code, "operation")} />
      ))}
    </div>
  );
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
      {transaction.resultCodes ? <ResultCodesSection resultCodes={transaction.resultCodes} /> : null}
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
