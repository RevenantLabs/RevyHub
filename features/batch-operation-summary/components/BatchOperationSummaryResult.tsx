import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy } from "@/features/batch-operation-summary/copy";
import { NativeAmountTotal } from "@/features/batch-operation-summary/components/NativeAmountTotal";
import { OperationTypeCounts } from "@/features/batch-operation-summary/components/OperationTypeCounts";
import { SourceAccountRows } from "@/features/batch-operation-summary/components/SourceAccountRows";
import type { BatchOperationSummaryResult as Result } from "@/features/batch-operation-summary/types";
export function BatchOperationSummaryResult({ result }: { result: Result }) { return <Card><CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader><div className="space-y-5"><p>{copy.operationTotal}: <strong>{result.operationTotal}</strong></p><NativeAmountTotal stroops={result.nativeAmountStroops} /><OperationTypeCounts counts={result.typeCounts} /><SourceAccountRows transactionSource={result.transactionSource} overrides={result.operationSources} /></div></Card>; }
