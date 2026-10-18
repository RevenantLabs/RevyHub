import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CodeBlock } from "@/core/ui/CodeBlock";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList, type DataListItem } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, modeLabels } from "@/features/manage-data-codec/copy";
import {
  formatBase64,
  formatBytes,
  formatCharacters,
  formatHex,
  formatNameBudget,
  formatText,
  formatValueBudget,
  isMultibyte
} from "@/features/manage-data-codec/lib/format";
import type { ManageDataEntry } from "@/features/manage-data-codec/types";

export function ManageDataCodecResult({ entry }: { entry: ManageDataEntry }) {
  const { name, value, decoded } = entry;

  const valueRows: DataListItem[] = value
    ? [
        { label: copy.labelByteLength, value: formatValueBudget(value), mono: true },
        {
          label: copy.labelHex,
          value: value.byteLength ? (
            <CopyableValue label={copy.copyHex} value={value.hex} />
          ) : (
            formatHex(value.hex)
          ),
          mono: true
        },
        {
          label: copy.labelBase64,
          value: value.byteLength ? (
            <CopyableValue label={copy.copyBase64} value={value.base64} />
          ) : (
            formatBase64(value.base64)
          ),
          mono: true
        },
        {
          label: copy.labelUtf8,
          value: formatText(value) ?? copy.noText,
          mono: true
        }
      ]
    : [];

  return (
    <div className="space-y-4">
      {entry.mode === "delete" ? (
        <StatusMessage
          type="info"
          title={copy.deleteTitle}
          description={copy.deleteDescription}
        />
      ) : null}

      {entry.mode === "set" && value?.byteLength === 0 ? (
        <StatusMessage
          type="info"
          title={copy.emptyValueTitle}
          description={copy.emptyValueDescription}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{copy.nameTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.labelMode, value: modeLabels[entry.mode] },
            {
              label: copy.labelDecodedName,
              value: <CopyableValue label={copy.copyName} value={name.text} full />
            },
            { label: copy.labelByteLength, value: formatNameBudget(name), mono: true },
            {
              label: copy.labelCharacterLength,
              value: formatCharacters(name.characterLength),
              mono: true
            },
            { label: copy.labelHex, value: formatHex(name.hex), mono: true }
          ]}
        />
        {isMultibyte(name) ? (
          <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.multibyteNotice}</p>
        ) : null}
      </Card>

      {value ? (
        <Card>
          <CardHeader>
            <CardTitle>{copy.valueTitle}</CardTitle>
          </CardHeader>
          <DataList items={valueRows} />
          {value.textLossless ? null : (
            <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.binaryNotice}</p>
          )}
          {value.hasControlBytes ? (
            <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.controlNotice}</p>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{copy.operationTitle}</CardTitle>
          <CardDescription>{copy.xdrNote}</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          <CopyableValue label={copy.copyXdr} value={entry.operationXdr} visible={12} />
          <CodeBlock label="base64">{entry.operationXdr}</CodeBlock>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.decodedTitle}</CardTitle>
          <CardDescription>{copy.roundTripNote}</CardDescription>
        </CardHeader>
        <DataList
          items={[
            { label: copy.labelDecodedName, value: decoded.name, mono: true },
            {
              label: copy.labelValuePresent,
              value: decoded.valuePresent ? copy.valuePresentYes : copy.valuePresentNo
            },
            {
              label: copy.labelDecodedValue,
              value:
                decoded.valueHex === null
                  ? "—"
                  : `${formatHex(decoded.valueHex)} (${formatBytes(
                      decoded.valueByteLength ?? 0
                    )})`,
              mono: true
            }
          ]}
        />
      </Card>
    </div>
  );
}
