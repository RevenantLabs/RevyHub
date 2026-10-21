import { copy } from "@/features/horizon-rate-limit-monitor/copy";
import { quotaCountdown } from "@/features/horizon-rate-limit-monitor/lib/quota-countdown";
export function QuotaCountdown({ reset, now }: { reset: string | null; now: number }) {
  const value = quotaCountdown(reset, now);
  if (reset === null) return <span>{copy.unavailable}</span>;
  return <span className="flex flex-col">
    <span className="font-mono">{reset}</span>
    <span className="text-[#4e5c73]">{copy.resetCountdown}: {value === "0h 0m 0s" ? copy.elapsed : value ?? copy.unavailable}</span>
  </span>;
}
