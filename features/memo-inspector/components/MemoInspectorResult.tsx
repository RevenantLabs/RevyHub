import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList, type DataListItem } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, segmentLabels, segmentNotes } from "@/features/memo-inspector/copy";
import {
  formatByteCount,
  formatHexBytes,
  formatMemoValue
} from "@/features/memo-inspector/lib/format";
import type { DecodedMemo, MemoEncoding, MemoInput } from "@/features/memo-inspector/types";

function inputEncodingLabel(input: MemoInput): string | null {
  if (input.kind !== "hash" && input.kind !== "return") return null;
  return input.encoding === "hex" ? copy.hexEncoding : copy.base64Encoding;
}

export function MemoInspectorResult({
  input,
  encoding,
  decoded
}: {
  input: MemoInput;
  encoding: MemoEncoding;
  decoded: DecodedMemo;
}) {
  const readAs = inputEncodingLabel(input);

  const summary: DataListItem[] = [
    { label: copy.typeRow, value: copy.kindOptions[encoding.kind] },
    {
      label: copy.inputRow,
      value: encoding.displayValue ? (
        <CopyableValue label={copy.inputRow} value={encoding.displayValue} full className="break-all" />
      ) : (
        copy.noValue
      )
    },
    ...(readAs ? [{ label: copy.inputEncodingRow, value: readAs }] : []),
    { label: copy.payloadSizeRow, value: formatByteCount(encoding.payloadByteLength) },
    { label: copy.totalSizeRow, value: formatByteCount(encoding.xdrByteLength) }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList items={summary} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.xdrTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.xdrBase64Label,
              value: (
                <CopyableValue
                  label={copy.xdrBase64Label}
                  value={encoding.xdrBase64}
                  full
                  className="break-all"
                />
              )
            },
            {
              label: copy.xdrHexLabel,
              value: (
                <CopyableValue
                  label={copy.xdrHexLabel}
                  value={encoding.xdrHex}
                  full
                  className="break-all"
                />
              )
            }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.layoutTitle}</CardTitle>
          <CardDescription>{copy.layoutDescription}</CardDescription>
        </CardHeader>
        <DataList
          items={encoding.segments.map((segment) => ({
            label: segmentLabels[segment.part],
            value: (
              <div className="space-y-1">
                <p className="break-all font-mono text-xs">{formatHexBytes(segment.hex)}</p>
                <p className="text-xs text-[#68758a]">
                  {segmentNotes[segment.part]} {formatByteCount(segment.byteLength)}
                </p>
              </div>
            )
          }))}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.decodedTitle}</CardTitle>
          <CardDescription>{copy.decodedDescription}</CardDescription>
        </CardHeader>
        <DataList
          items={[
            { label: copy.decodedTypeRow, value: decoded.typeName },
            {
              label: copy.decodedValueRow,
              value: formatMemoValue(decoded.value, copy.noValue),
              mono: decoded.kind !== "text"
            }
          ]}
        />
      </Card>

      <StatusMessage type="info" title={copy.disclaimer} />
    </div>
  );
}
