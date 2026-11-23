import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy, statusCopy } from "../copy";
import { formatIdentity, formatStroops } from "../lib/format";
import type { MergeTransfer } from "../types";

export function MergeTransferRows({ transfers }: { transfers: MergeTransfer[] }) {
  if (!transfers.length) return null;
  return <Card><CardHeader><CardTitle>{copy.transfersTitle}</CardTitle></CardHeader>
    <ol className="space-y-4">{transfers.map((transfer) => <li key={transfer.index} className="rounded-lg border border-[#e3ebf5] p-3">
      <DataList items={[
        { label: copy.operation, value: String(transfer.index + 1) },
        { label: copy.source, value: formatIdentity(transfer.source), mono: true },
        { label: copy.override, value: transfer.sourceOverride ? copy.overrideYes : copy.inherited },
        { label: copy.destination, value: formatIdentity(transfer.destination), mono: true },
        { label: copy.amount, value: transfer.stroops === null ? copy.unavailable : formatStroops(transfer.stroops), mono: true },
        { label: copy.status, value: statusCopy[transfer.status] },
        { label: copy.resultCode, value: transfer.code, mono: true }
      ]} />
    </li>)}</ol>
  </Card>;
}
