import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/transaction-lookup/copy";
import {
  formatFee,
  formatMemo,
  formatOperationType,
  formatTimestamp
} from "@/features/transaction-lookup/lib/format";
import type { TransactionSummary } from "@/features/transaction-lookup/types";

export function TransactionLookupResult({ transaction }: { transaction: TransactionSummary }) {
  const detailItems = [
    { label: "Hash", value: <CopyableValue label="hash" value={transaction.hash} visible={8} /> },
    { label: "Ledger", value: String(transaction.ledger), mono: true },
    { label: "Created", value: formatTimestamp(transaction.createdAt) },
    {
      label: "Source account",
      value: <CopyableValue label="source account" value={transaction.sourceAccount} />
    },
    { label: "Fee charged", value: formatFee(transaction.feeCharged) },
    { label: "Max fee", value: formatFee(transaction.maxFee) },
    { label: "Memo", value: formatMemo(transaction.memoType, transaction.memo) },
    { label: "Operations", value: String(transaction.operationCount) }
  ];

  if (!transaction.successful && transaction.resultCode) {
    detailItems.splice(1, 0, {
      label: copy.resultCodeLabel,
      value: <CopyableValue label="result code" value={transaction.resultCode} visible={transaction.resultCode.length} />
    });
  }

  return (
    <div className="space-y-4">
      <StatusMessage
        type={transaction.successful ? "success" : "error"}
        title={transaction.successful ? copy.succeeded : copy.failed}
      />

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList items={detailItems} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.operationsTitle}</CardTitle>
        </CardHeader>

        {transaction.operations.length ? (
          <ol className="space-y-2">
            {transaction.operations.map((operation, index) => (
              <li
                key={operation.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm"
              >
                <span className="font-mono text-xs text-[#8a98aa]">#{index + 1}</span>
                <span className="font-semibold text-[#172033]">
                  {formatOperationType(operation.type)}
                </span>
                <CopyableValue label="operation source" value={operation.sourceAccount} visible={4} />
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-[#68758a]">{copy.noOperations}</p>
        )}
      </Card>
    </div>
  );
}
