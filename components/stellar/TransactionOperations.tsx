import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import { StatusMessage } from "@/components/ui/StatusMessage";
import type { NormalizedOperation } from "@/lib/stellar/transaction";

/** Builds the display rows for a normalized operation's type-specific fields. */
function operationRows(operation: NormalizedOperation): [string, string][] {
  const rows: [string, string][] = [];
  const asset = operation.assetCode ?? operation.assetType;

  if (operation.amount) {
    rows.push(["Amount", asset ? `${operation.amount} ${asset}` : operation.amount]);
  } else if (operation.assetCode) {
    rows.push(["Asset code", operation.assetCode]);
  } else if (operation.assetType) {
    rows.push(["Asset type", operation.assetType]);
  }

  if (operation.from) rows.push(["From", operation.from]);
  if (operation.to) rows.push(["To", operation.to]);
  if (operation.funder) rows.push(["Funder", operation.funder]);
  if (operation.account) rows.push(["Account", operation.account]);
  if (operation.startingBalance) rows.push(["Starting balance", operation.startingBalance]);
  if (operation.assetIssuer) rows.push(["Asset issuer", operation.assetIssuer]);
  if (operation.price) rows.push(["Price", operation.price]);
  if (operation.offerId !== undefined) rows.push(["Offer ID", String(operation.offerId)]);
  if (operation.limit) rows.push(["Limit", operation.limit]);
  if (operation.dataName) rows.push(["Data name", operation.dataName]);
  if (operation.dataValue) rows.push(["Data value", operation.dataValue]);
  if (operation.into) rows.push(["Into", operation.into]);
  if (operation.balanceId) rows.push(["Balance ID", operation.balanceId]);
  if (operation.claimant) rows.push(["Claimant", operation.claimant]);
  if (operation.bumpTo) rows.push(["Bump to", operation.bumpTo]);

  return rows;
}

export function TransactionOperations({
  operations
}: {
  operations: NormalizedOperation[] | null;
}) {
  if (operations === null) {
    return (
      <StatusMessage
        type="warning"
        title="Operations unavailable"
        description="The transaction summary loaded, but its operation list could not be fetched from Horizon. Try again in a moment."
      />
    );
  }

  if (operations.length === 0) {
    return (
      <StatusMessage
        type="info"
        title="No operations"
        description="Horizon returned no operations for this transaction."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#172033]">Transaction operations</p>
        <Badge tone="info">{operations.length} total</Badge>
      </div>
      {operations.map((operation, index) => {
        const rows = operationRows(operation);

        return (
          <div
            key={`${operation.id}-${index}`}
            className="rounded-lg border border-white/80 bg-white/68 p-4 shadow-[4px_4px_0_rgba(142,220,244,0.16)]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="info">{operation.typeLabel}</Badge>
              <CopyableValue
                label="operation source account"
                value={operation.sourceAccount}
                visible={8}
              />
            </div>
            {rows.length > 0 ? (
              <dl className="mt-3 divide-y divide-[#c7d6e8] rounded-lg border border-white/80 bg-white/60">
                {rows.map(([label, value]) => (
                  <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                    <dt className="text-xs uppercase tracking-wide text-[#68758a]">{label}</dt>
                    <dd className="break-words text-sm text-[#29364d] sm:col-span-2">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
