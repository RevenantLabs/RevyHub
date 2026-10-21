import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/reserve-capacity-planner/copy";
import { formatCount, formatStroops, formatXlm } from "@/features/reserve-capacity-planner/lib/format";
import type { ReserveCapacityPlannerResult } from "@/features/reserve-capacity-planner/types";

export function ReserveProjection({ result }: { result: ReserveCapacityPlannerResult }) {
  const baseXlm = formatXlm(result.baseReserveXlm);
  const minimumXlm = formatXlm(result.minimumBalanceXlm);
  const subentries = formatCount(result.subentryCount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
        <CardDescription>
          {result.baseReserveOverridden ? copy.customBaseReserveNote : copy.defaultBaseReserveNote}
        </CardDescription>
      </CardHeader>
      <DataList
        items={[
          { label: copy.minimumBalanceLabel, value: minimumXlm, mono: true },
          { label: copy.baseReserveUsedLabel, value: `${baseXlm} (${formatStroops(result.baseReserveStroops)})`, mono: true },
          { label: copy.subentryCountLabel, value: subentries, mono: true }
        ]}
      />
      <p className="mt-4 break-words text-sm leading-6 text-[#172033]">
        {copy.formulaLine(baseXlm, subentries, minimumXlm)}
      </p>
      <p className="mt-1 break-words font-mono text-xs leading-5 text-[#4e5c73]">
        {copy.stroopFormulaLine(formatStroops(result.baseReserveStroops), subentries, formatStroops(result.minimumBalanceStroops))}
      </p>
      <p className="mt-3 text-xs leading-5 text-[#68758a]">{copy.offlineNote}</p>
    </Card>
  );
}
