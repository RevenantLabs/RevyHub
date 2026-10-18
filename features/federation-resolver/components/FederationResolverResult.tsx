import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/federation-resolver/copy";
import { formatFederationAddress } from "@/features/federation-resolver/schema";
import {
  formatMemo,
  formatMemoType,
  hostOf,
  requiresMemo
} from "@/features/federation-resolver/lib/format";
import type { FederationResolution } from "@/features/federation-resolver/types";

export function FederationResolverResult({
  resolution
}: {
  resolution: FederationResolution;
}) {
  const memoRequired = requiresMemo(resolution.record);

  return (
    <div className="space-y-4">
      {memoRequired ? (
        <StatusMessage
          type="warning"
          title={copy.memoWarningTitle}
          description={copy.memoWarningDescription}
        />
      ) : (
        <StatusMessage type="info" title={copy.noMemoTitle} description={copy.noMemoDescription} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.labelAddress,
              value: formatFederationAddress(resolution.address)
            },
            {
              label: copy.labelAccount,
              value: <CopyableValue label="account" value={resolution.record.accountId} />
            },
            { label: copy.labelMemoType, value: formatMemoType(resolution.record.memoType) },
            { label: copy.labelMemo, value: formatMemo(resolution.record) }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.provenanceTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.labelToml, value: resolution.tomlUrl, mono: true },
            {
              label: copy.labelServer,
              value: hostOf(resolution.federationServer),
              mono: true
            }
          ]}
        />
      </Card>
    </div>
  );
}
