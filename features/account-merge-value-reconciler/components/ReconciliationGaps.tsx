import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy, gapCopy } from "../copy";
import type { EvidenceGap } from "../types";

export function ReconciliationGaps({ gaps }: { gaps: EvidenceGap[] }) {
  if (!gaps.length) return null;
  return <Card><CardHeader><CardTitle>{copy.gapsTitle}</CardTitle></CardHeader>
    <ul className="list-disc space-y-2 pl-5 text-sm text-[#4e5c73]">{gaps.map((gap, index) => <li key={`${gap.index}-${gap.code}-${index}`}>
      <span className="font-bold">{gap.index === null ? copy.transactionLevel : `${copy.operation} ${gap.index + 1}`}: </span>
      {gapCopy[gap.code]}
    </li>)}</ul>
  </Card>;
}
