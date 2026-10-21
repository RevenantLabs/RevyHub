import { DataList } from "@/core/ui";
import { copy } from "../copy";
import { formatFeePercent } from "../lib/format";

export function FeeBoundsNotice({ feeBps }: { feeBps: number }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-bold text-[#4e5c73]">{copy.feeLabel}</h3>
      <DataList items={[{ label: copy.fields.feeBps.label, value: `${feeBps} bps (${formatFeePercent(feeBps)})` }]} />
    </div>
  );
}
