import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy } from "../copy";
import { formatHeader } from "../lib/format";
import type { HorizonHealthResult as Value } from "../types";
export function HorizonHealthResult({result}: {result: Value}) {
 const fields = ["endpoint", "observedAt", "coreLatest", "historyLatest", "historyElder", "lag", "horizonVersion", "coreVersion"] as const;
 return <Card><CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
 {result.degraded ? <StatusMessage type="warning" {...errorCopy.degraded}/> : <p>{copy.healthy}</p>}
 <p>{copy.threshold}</p><DataList items={[
 ...fields.map(key => ({label: copy[key], value: String(result[key])})),
 {label: copy.limit, value: formatHeader(result.rateLimit.limit)},
 {label: copy.remaining, value: formatHeader(result.rateLimit.remaining)},
 {label: copy.rateReset, value: formatHeader(result.rateLimit.reset)}]}/></Card>;
}
