import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { Badge } from "@/core/ui/Badge";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/batch-address-validator/copy";
import { cleanUniquePublicAddresses } from "@/features/batch-address-validator/lib/batchAddressValidator";
import {
  formatDuplicateLines,
  formatLineReason,
  formatSummary
} from "@/features/batch-address-validator/lib/format";
import type { BatchAddressValidatorResult as BatchAddressValidatorResultValue } from "@/features/batch-address-validator/types";

function lineBadgeTone(valid: boolean, code: string): "success" | "warning" | "danger" {
  if (valid) return "success";
  if (code === "secret_seed_rejected") return "warning";
  return "danger";
}

function lineBadgeLabel(valid: boolean, code: string): string {
  if (valid) return "valid";
  if (code === "secret_seed_rejected") return "secret key";
  return "invalid";
}

export function BatchAddressValidatorResult({ result }: { result: BatchAddressValidatorResultValue }) {
  const { summary, lines } = result;
  const [copied, setCopied] = useState(false);
  const cleanAddresses = useMemo(() => cleanUniquePublicAddresses(result), [result]);
  const allValid = summary.invalid === 0 && summary.duplicated === 0;

  return (
    <div className="space-y-4">
      {allValid ? <StatusMessage type="success" title={copy.allValidTitle} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>{copy.summaryTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: "Total", value: String(summary.total) },
            { label: "Valid", value: String(summary.valid) },
            { label: "Invalid", value: String(summary.invalid) },
            { label: "Duplicated rows", value: String(summary.duplicated) },
            ...(summary.secretSeeds > 0
              ? [{ label: "Secret keys rejected", value: String(summary.secretSeeds) }]
              : []),
            { label: "Overview", value: formatSummary(summary) }
          ]}
        />
      </Card>

      {cleanAddresses.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{copy.cleanListTitle}</CardTitle>
          </CardHeader>
          <textarea
            readOnly
            aria-label={copy.cleanListLabel}
            value={cleanAddresses.join("\n")}
            className="min-h-28 w-full rounded-md border border-[#cbd7e5] bg-[#f8fbff] p-3 font-mono text-xs"
          />
          <button
            type="button"
            className="mt-3 rounded-md bg-[#172033] px-4 py-2 text-sm font-semibold text-white"
            onClick={async () => {
              await navigator.clipboard.writeText(cleanAddresses.join("\n"));
              setCopied(true);
            }}
          >
            {copied ? copy.cleanListCopied : copy.cleanListCopy}
          </button>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{copy.linesTitle}</CardTitle>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
            <caption className="sr-only">{copy.resultTitle}</caption>
            <thead>
              <tr className="border-b border-[#e3ebf5]">
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.columnLine}
                </th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.columnAddress}
                </th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.columnStatus}
                </th>
                <th scope="col" className="py-2 font-bold text-[#4e5c73]">
                  {copy.columnReason}
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((entry) => (
                <tr key={entry.line} className="border-b border-[#f0f4f9] last:border-0">
                  <th scope="row" className="py-3 pr-4 font-semibold text-[#172033]">
                    {entry.line}
                  </th>
                  <td className="py-3 pr-4">
                    {entry.address ? (
                      <CopyableValue label={`line ${entry.line} address`} value={entry.address} visible={6} />
                    ) : (
                      <span className="text-[#8a98aa]">{copy.secretSeedRow}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge tone={lineBadgeTone(entry.valid, entry.code)}>
                      {lineBadgeLabel(entry.valid, entry.code)}
                    </Badge>
                  </td>
                  <td className="py-3 text-[#4e5c73]">
                    <span>{formatLineReason(entry.code)}</span>
                    {entry.duplicateLines ? (
                      <p className="mt-1 text-xs text-[#8a98aa]">
                        {formatDuplicateLines(
                          entry.duplicateLines.filter((lineNumber) => lineNumber !== entry.line)
                        )}
                      </p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
