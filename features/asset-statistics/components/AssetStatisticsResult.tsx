import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/asset-statistics/copy";
import { formatSummary } from "@/features/asset-statistics/lib/format";
import type { AssetStatisticsResult as AssetStatisticsResultValue } from "@/features/asset-statistics/types";

export function AssetStatisticsResult({ result }: { result: AssetStatisticsResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={[{ label: "Summary", value: formatSummary(result.summary) }]} />
    </Card>
  );
}
