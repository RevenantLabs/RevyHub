import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/sep24-transaction-status-tracker/copy";
import { formatAmount, formatKind } from "@/features/sep24-transaction-status-tracker/lib/format";
import type { Sep24TransactionStatusTrackerResult as ResultValue } from "@/features/sep24-transaction-status-tracker/types";
import { NextStepGuidance } from "@/features/sep24-transaction-status-tracker/components/NextStepGuidance";
import { StatusSummary } from "@/features/sep24-transaction-status-tracker/components/StatusSummary";

export function Sep24TransactionStatusTrackerResult({ result }: { result: ResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <StatusSummary status={result.status} explanation={result.explanation} />
        <NextStepGuidance nextStep={result.nextStep} />
        <DataList
          items={[
            { label: copy.kindLabel, value: formatKind(result.kind) },
            { label: copy.transferServerLabel, value: result.transferServer },
            { label: copy.amountInLabel, value: formatAmount(result.amountIn) },
            { label: copy.amountOutLabel, value: formatAmount(result.amountOut) },
            { label: copy.amountFeeLabel, value: formatAmount(result.amountFee) }
          ]}
        />
      </div>
    </Card>
  );
}
