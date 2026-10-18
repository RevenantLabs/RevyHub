import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy } from "@/features/account-activity-rollup/copy";
import type { ActivityGroup } from "@/features/account-activity-rollup/types";

export function DailyActivity({ groups }: { groups: ActivityGroup[] }) {
  return <Card><CardHeader><CardTitle>{copy.dayTitle}</CardTitle></CardHeader><ol className="space-y-2">{groups.map((group) => <li key={group.key} className="flex justify-between gap-3"><time dateTime={group.key}>{group.key}</time><strong>{group.count}</strong></li>)}</ol></Card>;
}
