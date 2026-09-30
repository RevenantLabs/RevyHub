import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/operation-budget-planner/copy";
import { formatSummary } from "@/features/operation-budget-planner/lib/format";
import type { OperationBudgetPlannerResult as OperationBudgetPlannerResultValue } from "@/features/operation-budget-planner/types";

export function OperationBudgetPlannerResult({ result }: { result: OperationBudgetPlannerResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={[{ label: "Summary", value: formatSummary(result.summary) }]} />
    </Card>
  );
}
