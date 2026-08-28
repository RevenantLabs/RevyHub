import { Card, CardHeader, CardTitle, CardDescription } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { Badge } from "@/core/ui/Badge";
import { copy } from "@/features/account-merge-preflight/copy";
import { formatAmount } from "@/features/account-merge-preflight/lib/format";
import type { AccountMergePreflightResult as AccountMergePreflightResultValue } from "@/features/account-merge-preflight/types";

export function AccountMergePreflightResult({ result }: { result: AccountMergePreflightResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{result.isMergeable ? copy.mergeableTitle : copy.notMergeableTitle}</CardTitle>
        <CardDescription>
          {result.isMergeable ? copy.mergeableDescription : copy.notMergeableDescription}
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0 space-y-6">
        {result.isMergeable ? (
          <DataList items={[{ label: "Transferable XLM", value: formatAmount(result.transferableXlm) }]} />
        ) : (
          <ul className="space-y-2">
            {result.blockingItems.map((item, i) => (
              <li key={i} className="flex items-center space-x-3 text-sm">
                <Badge>{item.type}</Badge>
                <span className="font-mono text-muted-foreground">{item.description}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
