import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy } from "@/features/account-activity-rollup/copy";
import { formatOperationType } from "@/features/account-activity-rollup/lib/format";
import type { ActivityGroup } from "@/features/account-activity-rollup/types";

export function TypeBreakdown({ groups }: { groups: ActivityGroup[] }) {
  return <Card><CardHeader><CardTitle>{copy.typeTitle}</CardTitle></CardHeader><ul className="space-y-2">{groups.map((group) => <li key={group.key} className="flex justify-between gap-3"><span>{formatOperationType(group.key)}</span><strong>{group.count}</strong></li>)}</ul></Card>;
}
