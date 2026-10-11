import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/soroban-fee-estimator/copy";
import { formatXlm, formatCount } from "@/features/soroban-fee-estimator/lib/format";
import type { SorobanFeeEstimatorResult as SorobanFeeEstimatorResultValue } from "@/features/soroban-fee-estimator/types";

export function SorobanFeeEstimatorResult({
  result,
}: {
  result: SorobanFeeEstimatorResultValue;
}) {
  const items = [
    { label: copy.declaredFeeLabel, value: `${formatXlm(result.declaredResourceFeeStroops)} XLM` },
    { label: copy.inclusionFeeLabel, value: `${formatXlm(result.inclusionFeeStroops)} XLM` },
    { label: copy.totalFeeLabel, value: `${formatXlm(result.estimatedTotalStroops)} XLM` },
    {
      label: copy.shortfallLabel,
      value: result.shortfallStroops === null ? copy.noShortfall : `${formatXlm(result.shortfallStroops)} XLM`,
    },
    { label: copy.dominantLabel, value: result.dominantComponent },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <DataList items={items} />
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{copy.componentLabel}</h4>
          <ul className="space-y-1">
            {result.components.map((component) => (
              <li
                key={component.name}
                className="flex items-center justify-between text-sm"
              >
                <span>{component.name}</span>
                <span className="text-muted-foreground">
                  {formatCount(component.count, component.name)} @ {formatXlm(component.unitPriceStroops)} XLM ={" "}
                  {formatXlm(component.totalStroops)} XLM
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">{copy.approximationNotice}</p>
      </div>
    </Card>
  );
}
