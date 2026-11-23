import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { HistoryCoverage } from "@/features/transaction-sequence-gap-auditor/components/HistoryCoverage";
import { SequenceGapRows } from "@/features/transaction-sequence-gap-auditor/components/SequenceGapRows";
import { copy } from "@/features/transaction-sequence-gap-auditor/copy";
import type { AuditorResult } from "@/features/transaction-sequence-gap-auditor/types";

export function TransactionSequenceGapAuditorResult({ result }: { result: AuditorResult }) {
  return (
    <div className="space-y-4">
      {result.coverage.incompleteEvidence ? (
        <StatusMessage
          type="info"
          title={copy.incompleteTitle}
          description={copy.incompleteDescription}
        />
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>{copy.overviewTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.provedBumps, value: String(result.provedBumpCount) },
            { label: copy.unexplained, value: String(result.unexplainedCount) },
            { label: copy.truncated, value: String(result.truncatedGapCount) }
          ]}
        />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{copy.coverageTitle}</CardTitle>
        </CardHeader>
        <HistoryCoverage coverage={result.coverage} />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{copy.gapsTitle}</CardTitle>
        </CardHeader>
        <SequenceGapRows gaps={result.gaps} />
      </Card>
    </div>
  );
}
