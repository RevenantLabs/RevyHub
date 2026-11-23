import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/claimable-predicate-evaluator/copy";
import type { EvaluatorResult } from "@/features/claimable-predicate-evaluator/types";
export function EvaluationContext({ result }: { result: EvaluatorResult }) {
  return <DataList items={[
    { label: copy.sourceLabel, value: copy.sourceNames[result.source] },
    { label: copy.evaluationLabel, value: `${result.evaluationTime} (${copy.userSupplied})` },
    { label: copy.creationLabel, value: result.creationTime ? `${result.creationTime} (${copy.userSupplied})` : copy.absent }
  ]} />;
}
