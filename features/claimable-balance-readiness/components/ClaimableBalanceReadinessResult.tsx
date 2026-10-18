import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/claimable-balance-readiness/copy";
import { ClaimantList } from "@/features/claimable-balance-readiness/components/ClaimantList";
import { PredicateTree } from "@/features/claimable-balance-readiness/components/PredicateTree";
import { ReadinessVerdict } from "@/features/claimable-balance-readiness/components/ReadinessVerdict";
import {
  formatBalanceHeading,
  formatCreationContext,
  formatTimestamp
} from "@/features/claimable-balance-readiness/lib/format";
import type { ClaimableBalanceReadinessResult as ResultValue } from "@/features/claimable-balance-readiness/types";

export function ClaimableBalanceReadinessResult({ result }: { result: ResultValue }) {
  const { timeContext } = result;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>

      <div className="space-y-5">
        <p className="text-lg font-extrabold text-[#172033]">{formatBalanceHeading(result)}</p>

        <ReadinessVerdict verdict={result.selectedVerdict} />

        <DataList
          items={[
            {
              label: copy.balanceIdLabel,
              value: <CopyableValue label="claimable balance ID" value={result.balanceId} visible={8} />
            },
            {
              label: copy.selectedClaimantLabel,
              value: <CopyableValue label="selected claimant" value={result.selectedClaimant} />
            },
            {
              label: copy.evaluationTimeLabel,
              value: formatTimestamp(timeContext.evaluationTime)
            },
            {
              label: copy.creationTimeLabel,
              value: timeContext.creationReliable
                ? formatCreationContext(timeContext.creationTime, true)
                : copy.creationUnavailable
            },
            {
              label: copy.ledgerLabel,
              value: String(result.lastModifiedLedger),
              mono: true
            },
            ...(result.sponsor
              ? [
                  {
                    label: copy.sponsorLabel,
                    value: <CopyableValue label="sponsor" value={result.sponsor} />
                  }
                ]
              : [])
          ]}
        />

        <ClaimantList claimants={result.claimants} />

        {result.selectedTree ? <PredicateTree tree={result.selectedTree} /> : null}
      </div>
    </Card>
  );
}
