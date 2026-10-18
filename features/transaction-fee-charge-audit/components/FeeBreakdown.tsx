import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/transaction-fee-charge-audit/copy";
import { formatStroops } from "@/features/transaction-fee-charge-audit/lib/format";
import type { FeeBreakdownValues } from "@/features/transaction-fee-charge-audit/types";

export function FeeBreakdown({ fees }: { fees: FeeBreakdownValues }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.feeBreakdownTitle}</CardTitle>
        <CardDescription>{copy.feeBreakdownDescription}</CardDescription>
      </CardHeader>
      <DataList
        items={[
          { label: copy.labelMaxFee, value: formatStroops(fees.maxFee), mono: true },
          { label: copy.labelFeeCharged, value: formatStroops(fees.feeCharged), mono: true },
          { label: copy.labelDifference, value: formatStroops(fees.difference), mono: true }
        ]}
      />
    </Card>
  );
}
