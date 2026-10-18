import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy } from "@/features/account-activity-rollup/copy";
import { formatCoverage, formatDayRange } from "@/features/account-activity-rollup/lib/format";
import type { CoverageWindow } from "@/features/account-activity-rollup/types";

export function CoverageNotice({ coverage }: { coverage: CoverageWindow }) {
  const range = formatDayRange(coverage);
  return <Card><CardHeader><CardTitle>{copy.coverageTitle}</CardTitle></CardHeader>
    <p>{formatCoverage(coverage)}</p>
    {range ? <p>{copy.coverageRange}: {range}</p> : null}
    <p>{coverage.hasMore ? copy.coverageMore : copy.coverageEnd}</p>
  </Card>;
}
