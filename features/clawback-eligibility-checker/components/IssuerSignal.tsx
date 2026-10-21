import { Badge, StatusMessage } from "@/core/ui";
import { copy, errorCopy } from "../copy";
import type { FetchOutcome, IssuerSignal as IssuerSignalValue } from "../types";

export function IssuerSignal({ issuer }: { issuer: FetchOutcome<IssuerSignalValue> }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-bold text-[#4e5c73]">{copy.issuerSignalTitle}</h3>
      {issuer.ok ? (
        <Badge tone={issuer.value.authClawbackEnabled ? "danger" : "muted"}>
          {copy.issuerFlagLabel}: {String(issuer.value.authClawbackEnabled)}
        </Badge>
      ) : (
        <StatusMessage type="error" {...errorCopy[issuer.code]} />
      )}
    </div>
  );
}
