import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "../copy";
import { formatFee } from "../lib/format";
import type { OperationResultXdrDecoderResult } from "../types";
export function TransactionVerdict({ result }: { result: OperationResultXdrDecoderResult }) {
  const verdict = result.verdict === "success" ? copy.success : result.verdict === "operation_failure" ? copy.operationFailure : copy.preOperationFailure;
  return <Card><CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
    <p className="mb-4 text-sm" role="status">{verdict}</p>
    <DataList items={[{ label: copy.hashLabel, value: result.hash, mono: true }, { label: copy.networkLabel, value: result.network }, { label: copy.codeLabel, value: result.transaction.code, mono: true }, { label: copy.causeLabel, value: result.transaction.explanation }, { label: copy.feeLabel, value: formatFee(result.feeCharged) }]} />
  </Card>;
}
