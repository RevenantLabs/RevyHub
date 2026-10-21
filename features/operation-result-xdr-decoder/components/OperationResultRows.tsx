import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "../copy";
import { formatOperation } from "../lib/format";
import type { OperationResultRow } from "../types";
export function OperationResultRows({ operations }: { operations: OperationResultRow[] }) {
  if (!operations.length) return null;
  return <section aria-label={copy.operationTitle} className="space-y-3"><h3 className="text-sm font-semibold">{copy.operationTitle}</h3>{operations.map((op) => <Card key={op.index}><CardHeader><CardTitle>{formatOperation(op.index, op.type)}</CardTitle></CardHeader><DataList items={[{ label: copy.typeLabel, value: op.type }, { label: copy.codeLabel, value: op.result.code, mono: true }, { label: copy.outerOperationLabel, value: op.outerCode, mono: true }, { label: copy.causeLabel, value: op.result.explanation }]} /></Card>)}</section>;
}
