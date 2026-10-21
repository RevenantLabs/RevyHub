import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/strkey-corruption-locator/copy";
import { CandidateRows } from "@/features/strkey-corruption-locator/components/CandidateRows";
import {
  formatCandidateBound,
  formatCandidateCount,
  formatLength
} from "@/features/strkey-corruption-locator/lib/format";
import type { CandidateReport } from "@/features/strkey-corruption-locator/types";

export function StrkeyCorruptionLocatorResult({ result }: { result: CandidateReport }) {
  const shown = result.candidates.length;
  const summary =
    shown < result.totalCandidates
      ? formatCandidateBound(shown, result.totalCandidates)
      : formatCandidateCount(result.totalCandidates);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList
        items={[
          { label: copy.lengthLabel, value: formatLength(result.length) },
          { label: copy.correctionsLabel, value: summary }
        ]}
      />
      <div className="mt-2 min-w-0">
        <CandidateRows candidates={result.candidates} />
      </div>
    </Card>
  );
}
