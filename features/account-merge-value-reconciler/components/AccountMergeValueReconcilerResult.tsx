import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "../copy";
import { formatIdentity, formatStroops } from "../lib/format";
import type { AccountMergeValueReconcilerResult as Reconciliation } from "../types";
import { MergeTransferRows } from "./MergeTransferRows";
import { ReconciliationGaps } from "./ReconciliationGaps";

export function AccountMergeValueReconcilerResult({ result }: { result: Reconciliation }) {
  return <div className="space-y-5">
    <StatusMessage type={result.evidence === "complete" ? "success" : "warning"}
      title={result.evidence === "complete" ? copy.completeTitle : copy.incompleteTitle} />
    <Card><CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
      <DataList items={[
        { label: copy.fee, value: formatStroops(result.feeStroops), mono: true },
        { label: copy.proceeds, value: formatStroops(result.mergeProceedsStroops), mono: true },
        { label: copy.unrelated, value: result.unrelatedBalanceChangesStroops === null ? copy.unavailable : formatStroops(result.unrelatedBalanceChangesStroops), mono: true },
        { label: copy.feePayer, value: formatIdentity(result.feePayer), mono: true },
        { label: copy.transactionSource, value: formatIdentity(result.transactionSource), mono: true },
        { label: copy.metaVersion, value: result.metadataVersion < 0 ? copy.unavailable : String(result.metadataVersion) }
      ]} />
      <p className="mt-4 text-xs text-[#68758a]">{copy.compatibilityNote}</p>
    </Card>
    <MergeTransferRows transfers={result.transfers} />
    <ReconciliationGaps gaps={result.gaps} />
    {result.metadataVersion >= 0 && <Card><CardHeader><CardTitle>{copy.unrelatedTitle}</CardTitle></CardHeader>
      {result.unrelatedChanges.length === 0
        ? <p className="text-sm text-[#4e5c73]">{copy.unrelatedEmpty}</p>
        : <ul className="space-y-3">{result.unrelatedChanges.map((change, index) => <li key={`${change.index}-${change.account}-${index}`} className="rounded-lg border border-[#e3ebf5] p-3">
          <DataList items={[
            { label: copy.operation, value: change.index === null ? copy.transactionLevel : String(change.index + 1) },
            { label: copy.account, value: formatIdentity(change.account), mono: true },
            { label: copy.change, value: formatStroops(change.stroops), mono: true }
          ]} />
        </li>)}</ul>}
    </Card>}
  </div>;
}
