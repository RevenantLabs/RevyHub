import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/account-merge-preflight/copy";
import { formatSummary } from "@/features/account-merge-preflight/lib/format";
import type { AccountMergePreflightResult as AccountMergePreflightResultValue } from "@/features/account-merge-preflight/types";

export function AccountMergePreflightResult({ result }: { result: AccountMergePreflightResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={[{ label: "Summary", value: formatSummary(result.summary) }]} />
    </Card>
  );
}
