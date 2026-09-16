import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import type { DataListItem } from "@/core/ui/DataList";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { copy } from "@/features/claimable-predicate-builder/copy";
import { formatTimestamp } from "@/features/claimable-predicate-builder/lib/format";
import type { ClaimablePredicateBuilderResult as ClaimablePredicateBuilderResultValue } from "@/features/claimable-predicate-builder/types";

export function ClaimablePredicateBuilderResult({
  result
}: {
  result: ClaimablePredicateBuilderResultValue;
}) {
  const timelineItems = result.timeline.map((entry) => ({
    label: `${copy.timelineFrom} ${entry.from === 0 ? "creation" : formatTimestamp(entry.from)}`,
    value:
      entry.to === null
        ? copy.timelineUnbounded
        : `${copy.timelineTo} ${formatTimestamp(entry.to)}`
  }));

  const items: DataListItem[] = [
    { label: copy.descriptionLabel, value: result.description },
    { label: copy.xdrLabel, value: <CopyableValue label={copy.xdrLabel} value={result.xdr} full /> }
  ];

  if (result.unsatisfiable) {
    items.push({ label: copy.unsatisfiableLabel, value: copy.unsatisfiableValue });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <DataList items={items} />
        {timelineItems.length > 0 ? (
          <>
            <h4 className="text-sm font-bold text-[#4e5c73]">{copy.timelineLabel}</h4>
            <DataList items={timelineItems} />
          </>
        ) : null}
      </div>
    </Card>
  );
}
