import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/multisig-analyzer/copy";
import { formatSummary, formatThreshold } from "@/features/multisig-analyzer/lib/format";
import type { MultisigAnalyzerResult as MultisigAnalyzerResultValue } from "@/features/multisig-analyzer/types";

export function MultisigAnalyzerResult({ result }: { result: MultisigAnalyzerResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList
        items={[
          { label: copy.sourceAccountLabelText, value: result.sourceAccount },
          { label: copy.transactionSourceLabel, value: result.transactionSourceAccount },
          { label: copy.requiredThresholdLabel, value: formatThreshold(result.requiredThreshold) },
          { label: copy.currentWeightLabel, value: result.signatureWeight },
          { label: copy.shortfallLabel, value: result.shortfallWeight },
          { label: "Summary", value: formatSummary(result) }
        ]}
      />
    </Card>
  );
}
