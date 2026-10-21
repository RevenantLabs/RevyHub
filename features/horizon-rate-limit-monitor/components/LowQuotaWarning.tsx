import { copy } from "@/features/horizon-rate-limit-monitor/copy";
export function LowQuotaWarning() { return <span className="ml-2 font-semibold text-[#9a513f]" title={copy.lowQuotaDescription}>{copy.lowQuotaTitle}</span>; }
