import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/account-data-entries/copy";
import { formatSummary } from "@/features/account-data-entries/lib/format";
import type { AccountDataEntriesResult as AccountDataEntriesResultValue } from "@/features/account-data-entries/types";

export function AccountDataEntriesResult({ result }: { result: AccountDataEntriesResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={[{ label: "Summary", value: formatSummary(result.summary) }]} />
    </Card>
  );
}
