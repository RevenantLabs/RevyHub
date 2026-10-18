import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { copy } from "@/features/payment-receipt-reconciler/copy";
import {
  formatAmountWithAsset,
  formatOperationType
} from "@/features/payment-receipt-reconciler/lib/format";
import type { PaymentOperation } from "@/features/payment-receipt-reconciler/types";

export function PaymentOperations({ operations }: { operations: PaymentOperation[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.operationsTitle}</CardTitle>
      </CardHeader>

      <ol className="space-y-3">
        {operations.map((operation) => (
          <li
            key={operation.id}
            className="space-y-2 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-3 text-sm"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-semibold text-[#172033]">
                {formatOperationType(operation.type)}
              </span>
              <CopyableValue label={copy.operationIdLabel} value={operation.id} visible={6} />
            </div>

            <dl className="grid gap-1 text-[#68758a]">
              <div className="flex flex-wrap gap-x-2">
                <dt>{copy.fromLabel}</dt>
                <dd>
                  <CopyableValue label={copy.fromLabel} value={operation.from} visible={4} />
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt>{copy.toLabel}</dt>
                <dd>
                  <CopyableValue label={copy.toLabel} value={operation.to} visible={4} />
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt>{copy.amountLabel}</dt>
                <dd className="font-mono text-[#172033]">
                  {formatAmountWithAsset(operation.amount, operation.asset)}
                </dd>
              </div>
              {operation.sourceAmount && operation.sourceAsset ? (
                <div className="flex flex-wrap gap-x-2">
                  <dt>{copy.sourceAmountLabel}</dt>
                  <dd className="font-mono text-[#172033]">
                    {formatAmountWithAsset(operation.sourceAmount, operation.sourceAsset)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </li>
        ))}
      </ol>
    </Card>
  );
}
