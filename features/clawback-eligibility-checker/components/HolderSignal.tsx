import { Badge, StatusMessage } from "@/core/ui";
import { copy, errorCopy } from "../copy";
import type { FetchOutcome, HolderSignal as HolderSignalValue } from "../types";

export function HolderSignal({ holder }: { holder: FetchOutcome<HolderSignalValue> }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-bold text-[#4e5c73]">{copy.holderSignalTitle}</h3>
      {holder.ok ? (
        <Badge tone={holder.value.clawbackEnabled ? "danger" : "muted"}>
          {copy.holderFlagLabel}: {String(holder.value.clawbackEnabled)}
        </Badge>
      ) : (
        <StatusMessage type="error" {...errorCopy[holder.code]} />
      )}
    </div>
  );
}
