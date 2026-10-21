import { CopyableValue } from "@/core/ui";
import { copy } from "../copy";

export function ComputedPoolId({ poolIdHex }: { poolIdHex: string }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-bold text-[#4e5c73]">{copy.poolIdLabel}</h3>
      <CopyableValue label={copy.poolIdLabel} value={poolIdHex} full />
    </div>
  );
}
