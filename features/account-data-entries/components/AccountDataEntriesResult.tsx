import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { Badge } from "@/core/ui/Badge";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { copy } from "@/features/account-data-entries/copy";
import { formatByteCount, formatHex } from "@/features/account-data-entries/lib/format";
import type { AccountDataEntries } from "@/features/account-data-entries/types";

export function AccountDataEntriesResult({ data }: { data: AccountDataEntries }) {
  if (!data.entries.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{copy.noEntriesTitle}</CardTitle>
        </CardHeader>
        <p className="text-sm leading-6 text-[#4e5c73]">{copy.noEntriesDescription}</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
          <caption className="sr-only">{copy.tableCaption(data.accountId)}</caption>
          <thead>
            <tr className="border-b border-[#e3ebf5]">
              <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">{copy.columnKey}</th>
              <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">{copy.columnType}</th>
              <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">{copy.columnDecoded}</th>
              <th scope="col" className="py-2 font-bold text-[#4e5c73]">{copy.columnRaw}</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((entry) => {
              const decoded = entry.decoded;
              const decodedValue =
                decoded.kind === "text"
                  ? decoded.text
                  : decoded.kind === "bytes"
                    ? formatHex(decoded.hex)
                    : null;

              return (
                <tr key={entry.key} className="border-b border-[#f0f4f9] align-top last:border-0">
                  <th scope="row" className="py-3 pr-4 font-mono font-semibold text-[#172033]">
                    {entry.key}
                  </th>
                  <td className="py-3 pr-4">
                    <span className="flex flex-col items-start gap-1">
                      <Badge tone={decoded.kind === "invalid_base64" ? "danger" : decoded.kind === "text" ? "success" : "info"}>
                        {decoded.kind === "text"
                          ? copy.typeText
                          : decoded.kind === "bytes"
                            ? copy.typeBytes
                            : copy.typeInvalid}
                      </Badge>
                      {decoded.kind !== "invalid_base64" ? (
                        <span className="text-xs text-[#68758a]">{formatByteCount(decoded.byteLength)}</span>
                      ) : null}
                    </span>
                  </td>
                  <td className="max-w-xs py-3 pr-4">
                    {decodedValue === null ? (
                      <span className="text-xs font-semibold text-[#9f342d]">{copy.invalidBase64}</span>
                    ) : (
                      <CopyableValue
                        label={copy.decodedCopyLabel(entry.key)}
                        value={decodedValue}
                        full
                      />
                    )}
                  </td>
                  <td className="max-w-xs py-3">
                    <CopyableValue
                      label={copy.rawCopyLabel(entry.key)}
                      value={entry.rawBase64}
                      full
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-[#68758a]">{copy.entryCount(data.entries.length)}</p>
    </Card>
  );
}
