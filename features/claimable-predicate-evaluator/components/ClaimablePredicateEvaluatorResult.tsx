import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/claimable-predicate-evaluator/copy";
import { displayExact, formatVerdict } from "@/features/claimable-predicate-evaluator/lib/format";
import { EvaluationContext } from "@/features/claimable-predicate-evaluator/components/EvaluationContext";
import { PredicateDecisionTree } from "@/features/claimable-predicate-evaluator/components/PredicateDecisionTree";
import type { EvaluatorResult } from "@/features/claimable-predicate-evaluator/types";
export function ClaimablePredicateEvaluatorResult({ result }: { result: EvaluatorResult }) {
  return <Card><CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>
    <div className="space-y-5">
      <DataList items={[
        { label: copy.verdict, value: `${result.claimant}: ${formatVerdict(result.verdict)}` },
        { label: copy.balanceId, value: displayExact(result.balanceId) },
        { label: copy.amount, value: displayExact(result.amount) },
        { label: copy.asset, value: displayExact(result.asset) },
        { label: copy.sponsor, value: displayExact(result.sponsor) },
        { label: copy.count, value: result.claimantCount?.toString() ?? copy.absent }
      ]} />
      <EvaluationContext result={result} />
      {result.limitation ? <StatusMessage type="warning" title={copy.incompleteTitle} description={result.limitation === "missing_creation" ? copy.missingCreation : copy.notListed} /> : <StatusMessage type="info" title={copy.resultTitle} description={copy.evidenceComplete} />}
      {result.tree ? <PredicateDecisionTree tree={result.tree} /> : null}
    </div>
  </Card>;
}
