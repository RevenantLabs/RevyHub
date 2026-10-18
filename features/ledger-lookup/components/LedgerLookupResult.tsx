import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "../copy";
import { formatValue, formatAge } from "../lib/format";
import type { LedgerLookupResult as Value } from "../types";
export function LedgerLookupResult({result}: {result: Value}) {
 const fields = ["sequence", "closedAt", "observedAt", "successful", "failed", "operations", "feePool", "totalCoins", "baseFee", "baseReserve", "protocol"] as const;
 return <Card><CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader><DataList items={[
 ...fields.map(key => ({label:copy[key], value:formatValue(result[key])})), {label:copy.age, value:formatAge(result.closedAt, result.observedAt)}]}/></Card>;
}
