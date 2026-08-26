import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/asset-flags-inspector/copy";
import { formatSummary } from "@/features/asset-flags-inspector/lib/format";
import type { AssetFlagsInspectorResult as AssetFlagsInspectorResultValue } from "@/features/asset-flags-inspector/types";

export function AssetFlagsInspectorResult({ result }: { result: AssetFlagsInspectorResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={[{ label: "Summary", value: formatSummary(result.summary) }]} />
    </Card>
  );
}
