import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/payment-receipt-reconciler/copy";
import {
  formatAmountWithAsset,
  formatFee
} from "@/features/payment-receipt-reconciler/lib/format";
import type { ReceiptTotals } from "@/features/payment-receipt-reconciler/types";

export function ReceiptTotals({ totals }: { totals: ReceiptTotals }) {
  const debitValue =
    totals.debits.length === 0
      ? "—"
      : totals.debits.map((entry) => formatAmountWithAsset(entry.amount, entry.asset)).join(", ");

  const creditValue =
    totals.credits.length === 0
      ? "—"
      : totals.credits
          .map((entry) => formatAmountWithAsset(entry.amount, entry.asset))
          .join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.totalsTitle}</CardTitle>
      </CardHeader>
      <DataList
        items={[
          { label: copy.debitLabel, value: debitValue, mono: true },
          { label: copy.creditLabel, value: creditValue, mono: true },
          { label: copy.feeLabel, value: formatFee(totals.feeCharged) }
        ]}
      />
    </Card>
  );
}
