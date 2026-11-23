import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/fee-bump-replacement-comparator/copy";
import {
  formatInnerIdentityReason,
  formatSignatureCount
} from "@/features/fee-bump-replacement-comparator/lib/format";
import type { FeeBumpReplacementComparatorResult } from "@/features/fee-bump-replacement-comparator/types";

export function InnerIdentityVerdict({
  result
}: {
  result: FeeBumpReplacementComparatorResult;
}) {
  const { innerIdentity, left, right, replacementCandidate } = result;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.innerIdentityTitle}</CardTitle>
        <CardDescription>{copy.identityNote}</CardDescription>
      </CardHeader>

      {replacementCandidate ? (
        <StatusMessage
          type="success"
          title={copy.equivalentTitle}
          description={copy.equivalentDescription}
        />
      ) : (
        <StatusMessage
          type="warning"
          title={copy.incompleteEvidenceTitle}
          description={copy.incompleteEvidenceDescription}
        />
      )}

      <div className="mt-4">
        <DataList
          items={[
            {
              label: copy.labelVerdict,
              value: formatInnerIdentityReason(innerIdentity.reason)
            },
            {
              label: copy.labelReplacement,
              value: replacementCandidate ? copy.yes : copy.no
            },
            {
              label: copy.labelHashesMatch,
              value: innerIdentity.hashesMatch ? copy.yes : copy.no
            },
            {
              label: copy.labelPayloadsMatch,
              value: innerIdentity.payloadsMatch ? copy.yes : copy.no
            },
            {
              label: copy.labelLeftInnerHash,
              value: (
                <CopyableValue label="current inner hash" value={innerIdentity.leftInnerHash} />
              )
            },
            {
              label: copy.labelRightInnerHash,
              value: (
                <CopyableValue
                  label="replacement inner hash"
                  value={innerIdentity.rightInnerHash}
                />
              )
            },
            { label: copy.labelLeftInnerSource, value: left.innerSource, mono: true },
            { label: copy.labelRightInnerSource, value: right.innerSource, mono: true },
            { label: copy.labelLeftInnerSequence, value: left.innerSequence, mono: true },
            { label: copy.labelRightInnerSequence, value: right.innerSequence, mono: true },
            {
              label: copy.labelLeftInnerSignatures,
              value: formatSignatureCount(left.innerSignatureCount)
            },
            {
              label: copy.labelRightInnerSignatures,
              value: formatSignatureCount(right.innerSignatureCount)
            }
          ]}
        />
      </div>

      <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.hashNote}</p>
      {!replacementCandidate ? (
        <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.refusedDescription}</p>
      ) : null}
    </Card>
  );
}
