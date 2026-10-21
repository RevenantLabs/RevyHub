import { copy } from "@/features/horizon-rate-limit-monitor/copy";
import { formatHeader, formatReporting } from "@/features/horizon-rate-limit-monitor/lib/format";
import { QuotaCountdown } from "@/features/horizon-rate-limit-monitor/components/QuotaCountdown";
import { LowQuotaWarning } from "@/features/horizon-rate-limit-monitor/components/LowQuotaWarning";
import type { EndpointQuota } from "@/features/horizon-rate-limit-monitor/types";
export function EndpointQuotaRows({ endpoints, now }: { endpoints: EndpointQuota[]; now: number }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[38rem] border-collapse text-left text-sm">
    <caption className="sr-only">{copy.resultTitle}</caption><thead><tr className="border-b"><th scope="col">{copy.endpoint}</th><th scope="col">{copy.limit}</th><th scope="col">{copy.remaining}</th><th scope="col">{copy.reset}</th><th scope="col">{copy.reporting}</th></tr></thead>
    <tbody>{endpoints.map(({ endpoint, headers, lowQuota }) => <tr key={endpoint} className="border-b last:border-0">
      <th scope="row" className="py-3 pr-3 font-mono">{endpoint}</th><td>{formatHeader(headers.limit)}</td><td>{formatHeader(headers.remaining)}{lowQuota && <LowQuotaWarning />}</td>
      <td><QuotaCountdown reset={headers.reset} now={now} /></td><td>{formatReporting(headers.reporting)}</td>
    </tr>)}</tbody>
  </table></div>;
}
