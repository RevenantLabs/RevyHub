import { Badge } from "@/core/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { EmptyState } from "@/core/ui/EmptyState";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { Database } from "lucide-react";
import { copy } from "@/features/account-data-entries/copy";
import {
  formatByteLength,
  formatDecodedAccountDataValue
} from "@/features/account-data-entries/lib/format";
import type {
  AccountDataEntriesResult as AccountDataEntriesResultValue,
  AccountDataValue
} from "@/features/account-data-entries/types";

function badgeTone(kind: AccountDataValue["kind"]): "info" | "muted" | "warning" {
  if (kind === "text") return "info";
  if (kind === "bytes") return "muted";
  return "warning";
}

export function AccountDataEntriesResult({ result }: { result: AccountDataEntriesResultValue }) {
  const invalidEntries = result.entries.filter((entry) => entry.value.kind === "invalid_base64");

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.accountLabel,
              value: (
                <CopyableValue
                  label={copy.accountCopyLabel}
                  value={result.accountId}
                  visible={8}
                />
              )
            },
            {
              label: copy.entryCountLabel,
              value: String(result.entries.length),
              mono: true
            }
          ]}
        />
      </Card>

      {result.entries.length === 0 ? (
        <EmptyState
          icon={Database}
          title={copy.noEntriesTitle}
          description={copy.noEntriesDescription}
        />
      ) : (
        <>
          {invalidEntries.length ? (
            <StatusMessage
              type="warning"
              title={copy.invalidRowsTitle}
              description={copy.invalidRowsDescription(invalidEntries.length)}
            />
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{copy.entriesTitle}</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[60rem] border-collapse text-left text-sm">
                <caption className="sr-only">{copy.tableCaption(result.accountId)}</caption>
                <thead>
                  <tr className="border-b border-[#e3ebf5]">
                    <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                      {copy.keyColumn}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                      {copy.typeColumn}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                      {copy.decodedColumn}
                    </th>
                    <th scope="col" className="py-2 font-bold text-[#4e5c73]">
                      {copy.rawColumn}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.entries.map((entry) => (
                    <tr key={entry.key} className="border-b border-[#f0f4f9] last:border-0 align-top">
                      <th scope="row" className="py-3 pr-4 font-normal">
                        <CopyableValue label={copy.keyCopyLabel(entry.key)} value={entry.key} />
                      </th>
                      <td className="py-3 pr-4">
                        <Badge tone={badgeTone(entry.value.kind)}>
                          {copy.valueKinds[entry.value.kind]}
                        </Badge>
                      </td>
                      <td className="max-w-xl py-3 pr-4 text-[#172033]">
                        {entry.value.kind === "invalid_base64" ? (
                          <div className="space-y-2">
                            <p className="font-semibold text-[#9a513f]">Invalid base64</p>
                            <p className="text-sm leading-6 text-[#9a513f]">
                              {copy.invalidValueDescription}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <CopyableValue
                              label={copy.decodedCopyLabel(entry.key)}
                              value={formatDecodedAccountDataValue(entry.value)}
                              full
                            />
                            <p className="text-xs text-[#68758a]">
                              {formatByteLength(entry.value.byteLength)}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <CopyableValue
                          label={copy.rawCopyLabel(entry.key)}
                          value={entry.rawBase64}
                          full
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
