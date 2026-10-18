import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy } from "../copy";
import { formatValue } from "../lib/format";
import type { NetworkComparisonResult as Value } from "../types";
export function NetworkComparisonResult({result}:{result:Value}) {
 const fields = ["observedAt","ledger","protocol","baseFee","baseReserve","coreLatest","historyLatest","lag"] as const;
 return <section className="space-y-4"><h2>{copy.resultTitle}</h2><p>{copy.resetNotice}</p><p>{copy.independence}</p>
 {result.partial && <StatusMessage type="warning" {...errorCopy.partial_failure}/>}
 {result.protocolDiffers ? <StatusMessage type="warning" title={copy.protocolDiffers}/> : <p>{result.protocolDiffers === null ? copy.unknownProtocol : copy.sameProtocol}</p>}
 {result.feeDiffers && <StatusMessage type="info" title={copy.feeDiffers}/>}{result.reserveDiffers && <StatusMessage type="info" title={copy.reserveDiffers}/>}
 <div className="grid gap-4 md:grid-cols-2">{(["testnet","mainnet"] as const).map(network => {
 const column = result[network];return <Card key={network}><CardHeader><CardTitle>{copy[network]}</CardTitle></CardHeader>{column.ok ? <DataList items={fields.map(field => ({label:copy[field],value:formatValue(column.value[field])}))}/> : <StatusMessage type="error" {...errorCopy[column.code]}/>}</Card>;
 })}</div></section>;
}
