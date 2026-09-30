import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/transaction-timebound-planner/copy";
import { formatSummary } from "@/features/transaction-timebound-planner/lib/format";
import type { TransactionTimeboundPlannerResult as TransactionTimeboundPlannerResultValue } from "@/features/transaction-timebound-planner/types";

export function TransactionTimeboundPlannerResult({ result }: { result: TransactionTimeboundPlannerResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={[{ label: "Summary", value: formatSummary(result.summary) }]} />
    </Card>
  );
}
