import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList, type DataListItem } from "@/core/ui/DataList";
import { copy } from "@/features/strkey-inspector/copy";
import {
  formatByteLength,
  formatHex,
  formatKind
} from "@/features/strkey-inspector/lib/format";
import type { StrkeyInspectorResult as ResultValue } from "@/features/strkey-inspector/types";

export function StrkeyInspectorResult({ result }: { result: ResultValue }) {
  const items: DataListItem[] = [
    { label: copy.fieldKind, value: formatKind(result.kind) },
    { label: copy.fieldPrefix, value: result.prefix, mono: true },
    {
      label: copy.fieldStrkey,
      value: (
        <CopyableValue
          label={copy.fieldStrkey}
          value={result.strkey}
          visible={8}
        />
      )
    },
    {
      label: copy.fieldHex,
      value: (
        <CopyableValue
          label={copy.fieldHex}
          value={formatHex(result.rawBytesHex)}
          full
        />
      )
    },
    { label: copy.fieldByteLength, value: formatByteLength(result.byteLength) }
  ];

  if (result.kind === "muxed_account" && result.muxedGAddress && result.muxedId) {
    items.push(
      {
        label: copy.fieldMuxedGAddress,
        value: (
          <CopyableValue
            label={copy.fieldMuxedGAddress}
            value={result.muxedGAddress}
            visible={8}
          />
        )
      },
      {
        label: copy.fieldMuxedId,
        value: result.muxedId,
        mono: true
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={items} />
    </Card>
  );
}
