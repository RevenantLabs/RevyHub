import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { Badge } from "@/core/ui/Badge";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/asset-flags-inspector/copy";
import {
  describeFlag,
  FLAG_LABELS,
  FLAG_ORDER,
  formatFlagState
} from "@/features/asset-flags-inspector/lib/format";
import type { AssetFlagsInspectorResult } from "@/features/asset-flags-inspector/types";

export function AssetFlagsInspectorResult({ result }: { result: AssetFlagsInspectorResult }) {
  return (
    <div className="space-y-4">
      <StatusMessage type="info" title={copy.summaryTitle} description={result.summary} />

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>

        <div className="mb-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#68758a]">
            {copy.issuerLabel}
          </p>
          <CopyableValue label="issuer" value={result.issuerId} visible={6} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <caption className="sr-only">Authorization flags for issuer {result.issuerId}</caption>
            <thead>
              <tr className="border-b border-[#e3ebf5]">
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.flagColumn}
                </th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.stateColumn}
                </th>
                <th scope="col" className="py-2 font-bold text-[#4e5c73]">
                  {copy.meaningColumn}
                </th>
              </tr>
            </thead>
            <tbody>
              {FLAG_ORDER.map((flag) => {
                const enabled = result.flags[flag];
                const highlighted = flag === "authImmutable" && enabled;

                return (
                  <tr
                    key={flag}
                    className={`border-b border-[#f0f4f9] last:border-0 ${highlighted ? "bg-[#fff8f0]" : ""}`}
                  >
                    <th
                      scope="row"
                      className="py-3 pr-4 font-semibold text-[#172033]"
                    >
                      <span className="flex items-center gap-2">
                        {FLAG_LABELS[flag]}
                        {highlighted ? <Badge tone="warning">permanent</Badge> : null}
                      </span>
                    </th>
                    <td className="py-3 pr-4">
                      <Badge tone={enabled ? "warning" : "muted"}>{formatFlagState(enabled)}</Badge>
                    </td>
                    <td className="py-3 text-[#4e5c73]">{describeFlag(flag, enabled)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {result.callouts.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{copy.calloutsTitle}</CardTitle>
          </CardHeader>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-[#4e5c73]">
            {result.callouts.map((callout) => (
              <li key={callout}>{callout}</li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
