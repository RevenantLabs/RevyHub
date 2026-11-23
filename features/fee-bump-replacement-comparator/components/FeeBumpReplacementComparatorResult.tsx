import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/fee-bump-replacement-comparator/copy";
import { InnerIdentityVerdict } from "@/features/fee-bump-replacement-comparator/components/InnerIdentityVerdict";
import { OuterFeeComparison } from "@/features/fee-bump-replacement-comparator/components/OuterFeeComparison";
import { describeNetwork } from "@/features/fee-bump-replacement-comparator/lib/format";
import type { FeeBumpReplacementComparatorResult } from "@/features/fee-bump-replacement-comparator/types";

export function FeeBumpReplacementComparatorResult({
  result
}: {
  result: FeeBumpReplacementComparatorResult;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.overviewTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.labelReplacement,
              value: result.replacementCandidate ? copy.yes : copy.no
            },
            {
              label: copy.labelPassphrase,
              value: `${describeNetwork(result.networkPassphrase)} — ${result.networkPassphrase}`
            }
          ]}
        />
      </Card>

      <InnerIdentityVerdict result={result} />
      <OuterFeeComparison outer={result.outerFee} />
    </div>
  );
}
