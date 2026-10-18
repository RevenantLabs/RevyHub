import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList, type DataListItem } from "@/core/ui/DataList";
import { copy } from "@/features/transaction-fee-charge-audit/copy";
import {
  formatEnvelopeKind,
  formatOperationCount,
  formatStroops
} from "@/features/transaction-fee-charge-audit/lib/format";
import type { EnvelopeAudit } from "@/features/transaction-fee-charge-audit/types";

export function EnvelopeType({
  envelope,
  operationCount,
  hash
}: {
  envelope: EnvelopeAudit;
  operationCount: number;
  hash: string;
}) {
  const items: DataListItem[] = [
    {
      label: copy.labelHash,
      value: <CopyableValue label={copy.copyHash} value={hash} visible={8} />
    },
    { label: copy.labelEnvelopeKind, value: formatEnvelopeKind(envelope.kind) },
    { label: copy.labelOperationCount, value: formatOperationCount(operationCount) }
  ];

  if (envelope.kind === "classic") {
    items.push({
      label: copy.labelSourceAccount,
      value: <CopyableValue label={copy.copySource} value={envelope.sourceAccount} />
    });
  } else {
    items.push(
      {
        label: copy.labelOuterFeeSource,
        value: (
          <CopyableValue label={copy.copyOuterFeeSource} value={envelope.outerFeeSource} />
        )
      },
      {
        label: copy.labelInnerSource,
        value: <CopyableValue label={copy.copyInnerSource} value={envelope.innerSourceAccount} />
      },
      { label: copy.labelInnerFee, value: formatStroops(envelope.innerFee), mono: true }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.envelopeTitle}</CardTitle>
        <CardDescription>
          {envelope.kind === "fee_bump"
            ? copy.envelopeFeeBumpDescription
            : copy.envelopeClassicDescription}
        </CardDescription>
      </CardHeader>
      <DataList items={items} />
    </Card>
  );
}
