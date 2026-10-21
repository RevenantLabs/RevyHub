import { Badge, DataList } from "@/core/ui";
import { copy } from "../copy";
import type { CanonicalOrdering as CanonicalOrderingValue } from "../types";

export function CanonicalOrdering({ ordering }: { ordering: CanonicalOrderingValue }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-[#4e5c73]">{copy.orderingTitle}</h3>
      <DataList
        items={[
          { label: copy.assetALabel, value: ordering.assetA.display, mono: true },
          { label: copy.assetBLabel, value: ordering.assetB.display, mono: true }
        ]}
      />
      <Badge tone={ordering.swapped ? "warning" : "muted"}>
        {ordering.swapped ? copy.swappedNote : copy.notSwappedNote}
      </Badge>
    </div>
  );
}
