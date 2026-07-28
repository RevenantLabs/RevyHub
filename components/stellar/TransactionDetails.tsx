import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import type { StellarNetwork } from "@/lib/stellar/horizon";
import type { NormalizedOperation } from "@/lib/stellar/transaction";

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
  operations: NormalizedOperation[];
}

function formatFee(stroops: string) {
  const fee = Number(stroops);

  if (!Number.isFinite(fee)) {
    return `${stroops} stroops`;
  }

  return `${fee} stroops (${(fee / 10_000_000).toFixed(7)} XLM)`;
}

/* ------------------------------------------------------------------ */
/*  Operation type field descriptors                                   */
/* ------------------------------------------------------------------ */

const OPERATION_DISPLAY_FIELDS: Record<
  string,
  { label: string; key: keyof NormalizedOperation }[]
> = {
  create_account: [
    { label: "Account", key: "account" },
    { label: "Funded by", key: "funder" },
    { label: "Starting balance", key: "startingBalance" },
  ],
  payment: [
    { label: "From", key: "from" },
    { label: "To", key: "to" },
    { label: "Amount", key: "amount" },
    { label: "Asset", key: "assetCode" },
  ],
  path_payment_strict_receive: [
    { label: "From", key: "from" },
    { label: "To", key: "to" },
    { label: "Amount", key: "amount" },
    { label: "Asset", key: "assetCode" },
  ],
  path_payment_strict_send: [
    { label: "From", key: "from" },
    { label: "To", key: "to" },
    { label: "Amount", key: "amount" },
    { label: "Asset", key: "assetCode" },
  ],
  manage_buy_offer: [
    { label: "Offer ID", key: "offerId" },
    { label: "Amount", key: "amount" },
    { label: "Price", key: "price" },
  ],
  manage_sell_offer: [
    { label: "Offer ID", key: "offerId" },
    { label: "Amount", key: "amount" },
    { label: "Price", key: "price" },
  ],
  create_passive_sell_offer: [
    { label: "Offer ID", key: "offerId" },
    { label: "Amount", key: "amount" },
    { label: "Price", key: "price" },
  ],
  change_trust: [
    { label: "Asset code", key: "assetCode" },
    { label: "Asset issuer", key: "assetIssuer" },
    { label: "Limit", key: "limit" },
  ],
  manage_data: [
    { label: "Data name", key: "dataName" },
    { label: "Data value", key: "dataValue" },
  ],
  account_merge: [
    { label: "Account", key: "account" },
    { label: "Into", key: "into" },
  ],
  bump_sequence: [{ label: "Bump to", key: "bumpTo" }],
  claim_claimable_balance: [
    { label: "Balance ID", key: "balanceId" },
    { label: "Claimant", key: "claimant" },
  ],
  clawback: [
    { label: "From", key: "from" },
    { label: "Amount", key: "amount" },
    { label: "Asset", key: "assetCode" },
  ],
};

/* ------------------------------------------------------------------ */
/*  OperationCard                                                      */
/* ------------------------------------------------------------------ */

function OperationCard({ operation }: { operation: NormalizedOperation }) {
  const fields = OPERATION_DISPLAY_FIELDS[operation.type] ?? [];

  return (
    <div className="rounded-lg border border-white/80 bg-white/68 p-4 shadow-[4px_4px_0_rgba(142,220,244,0.18)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Badge tone="muted">{operation.typeLabel}</Badge>
      </div>
      {fields.length > 0 ? (
        <dl className="mt-3 divide-y divide-[#c7d6e8]/50">
          {fields.map(({ label, key }) => {
            const value = operation[key];
            if (value == null || String(value) === "") return null;
            return (
              <div key={key as string} className="grid gap-0 py-2 sm:grid-cols-[140px_1fr]">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#68758a]">
                  {label}
                </dt>
                <dd className="break-all text-sm text-[#29364d]">
                  {key === "account" || key === "from" || key === "to" || key === "funder" || key === "into" || key === "assetIssuer" || key === "claimant" ? (
                    <CopyableValue
                      label={`${label.toLowerCase()}`}
                      value={String(value)}
                    />
                  ) : (
                    String(value)
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : (
        <p className="mt-2 text-xs text-[#8a98aa]">
          {operation.type} operation — no additional details available
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  OperationsPanel                                                    */
/* ------------------------------------------------------------------ */

function OperationsPanel({ operations }: { operations: NormalizedOperation[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-[#172033]">
          Operations
        </h3>
        <Badge tone="info">{operations.length}</Badge>
      </div>

      {operations.length === 0 ? (
        <div className="rounded-lg border border-[#c7d6e8]/50 bg-white/60 p-6 text-center">
          <p className="text-sm text-[#68758a]">
            The detective comet looked closely but found no operations recorded for this transaction.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {operations.map((op, index) => (
            <OperationCard key={op.id || index} operation={op} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TransactionDetails component                                       */
/* ------------------------------------------------------------------ */

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
    <div className="space-y-4">
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

      <hr className="border-[#c7d6e8]" />

      <OperationsPanel operations={transaction.operations} />
    </div>
  );
}
