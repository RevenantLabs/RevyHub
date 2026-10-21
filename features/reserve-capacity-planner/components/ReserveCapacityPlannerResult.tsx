import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { ReserveProjection } from "@/features/reserve-capacity-planner/components/ReserveProjection";
import { copy } from "@/features/reserve-capacity-planner/copy";
import { formatCount, formatXlm } from "@/features/reserve-capacity-planner/lib/format";
import type { ReserveCapacityPlannerResult as ResultValue } from "@/features/reserve-capacity-planner/types";

export function ReserveCapacityPlannerResult({ result }: { result: ResultValue }) {
  const spendable = result.spendableBalanceXlm === null ? copy.notProvided : formatXlm(result.spendableBalanceXlm);
  const starting = result.startingBalanceXlm === null ? copy.notProvided : formatXlm(result.startingBalanceXlm);

  return (
    <div className="space-y-5">
      {result.belowMinimum && result.shortfallXlm ? (
        <p
          role="status"
          className="rounded-lg border border-[#ffc3a8] bg-[#fff2e9] p-4 text-sm font-semibold leading-6 text-[#172033]"
        >
          {copy.belowMinimumTitle} {copy.belowMinimumDescription(formatXlm(result.shortfallXlm))}
        </p>
      ) : null}

      <ReserveProjection result={result} />

      <Card>
        <CardHeader>
          <CardTitle>{copy.breakdownTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.trustlinesLabel, value: formatCount(result.trustlines), mono: true },
            { label: copy.offersLabel, value: formatCount(result.offers), mono: true },
            { label: copy.dataEntriesLabel, value: formatCount(result.dataEntries), mono: true },
            { label: copy.signersLabel, value: formatCount(result.signers), mono: true },
            { label: copy.accountReserveLabel, value: formatXlm(result.accountReserveXlm), mono: true },
            { label: copy.subentryReserveLabel, value: formatXlm(result.subentryReserveXlm), mono: true },
            { label: copy.startingBalanceResultLabel, value: starting, mono: true },
            { label: copy.spendableLabel, value: spendable, mono: true }
          ]}
        />
      </Card>
    </div>
  );
}
