import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/fee-bump-replacement-comparator/copy";
import {
  formatFee,
  formatOperationCount,
  formatOuterFeeDelta,
  formatSignatureCount
} from "@/features/fee-bump-replacement-comparator/lib/format";
import type { OuterFeeComparisonResult } from "@/features/fee-bump-replacement-comparator/types";

export function OuterFeeComparison({ outer }: { outer: OuterFeeComparisonResult }) {
  const feeNote = outer.feeIncreased
    ? copy.feeIncreasedNote
    : outer.feeDecreased
      ? copy.feeDecreasedNote
      : copy.feeUnchangedNote;

  const sourceNote = outer.sameFeeSource ? copy.feeSourceSameNote : copy.feeSourceChangedNote;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.outerFeeTitle}</CardTitle>
        <CardDescription>{feeNote}</CardDescription>
      </CardHeader>
      <DataList
        items={[
          { label: copy.labelLeftOuterFee, value: formatFee(outer.leftOuterFee), mono: true },
          { label: copy.labelRightOuterFee, value: formatFee(outer.rightOuterFee), mono: true },
          { label: copy.labelFeeDelta, value: formatOuterFeeDelta(outer), mono: true },
          { label: copy.labelLeftFeeSource, value: outer.leftFeeSource, mono: true },
          { label: copy.labelRightFeeSource, value: outer.rightFeeSource, mono: true },
          {
            label: copy.labelLeftOuterSignatures,
            value: formatSignatureCount(outer.leftOuterSignatureCount)
          },
          {
            label: copy.labelRightOuterSignatures,
            value: formatSignatureCount(outer.rightOuterSignatureCount)
          },
          {
            label: copy.labelLeftInnerOps,
            value: formatOperationCount(outer.leftInnerOperationCount)
          },
          {
            label: copy.labelRightInnerOps,
            value: formatOperationCount(outer.rightInnerOperationCount)
          }
        ]}
      />
      <p className="mt-4 text-xs leading-5 text-[#68758a]">{sourceNote}</p>
      <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.noSubmitNote}</p>
    </Card>
  );
}
