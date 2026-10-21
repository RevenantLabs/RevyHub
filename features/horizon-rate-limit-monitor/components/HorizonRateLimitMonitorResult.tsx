"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy } from "@/features/horizon-rate-limit-monitor/copy";
import { formatCheckedAt } from "@/features/horizon-rate-limit-monitor/lib/format";
import { EndpointQuotaRows } from "@/features/horizon-rate-limit-monitor/components/EndpointQuotaRows";
import type { MonitorResult } from "@/features/horizon-rate-limit-monitor/types";
export function HorizonRateLimitMonitorResult({ result }: { result: MonitorResult }) {
  const [now, setNow] = useState(result.checkedAt);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, [result]);
  return <Card><CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
    <p className="mb-3 text-sm text-[#4e5c73]">{copy.checkedAt}: {formatCheckedAt(result.checkedAt)} · {copy.threshold}: {result.lowQuotaThreshold}</p>
    <EndpointQuotaRows endpoints={result.endpoints} now={now} />
  </Card>;
}
