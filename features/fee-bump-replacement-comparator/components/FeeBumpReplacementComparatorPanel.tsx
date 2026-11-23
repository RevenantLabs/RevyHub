"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { errorCopy } from "@/features/fee-bump-replacement-comparator/copy";
import { useFeeBumpReplacementComparator } from "@/features/fee-bump-replacement-comparator/hooks/useFeeBumpReplacementComparator";
import { FeeBumpReplacementComparatorForm } from "@/features/fee-bump-replacement-comparator/components/FeeBumpReplacementComparatorForm";
import { FeeBumpReplacementComparatorResult } from "@/features/fee-bump-replacement-comparator/components/FeeBumpReplacementComparatorResult";
import { FeeBumpReplacementComparatorEmptyState } from "@/features/fee-bump-replacement-comparator/components/FeeBumpReplacementComparatorEmptyState";
import { isUnsupportedVariant } from "@/features/fee-bump-replacement-comparator/lib/feeBumpReplacementComparator.errors";

export function FeeBumpReplacementComparatorPanel() {
  const { state, submit, redactions } = useFeeBumpReplacementComparator();

  return (
    <div className="space-y-5">
      <Card>
        {/*
          Keying on the redaction counter remounts the form when a secret key
          is refused, which is what actually clears it out of the field.
        */}
        <FeeBumpReplacementComparatorForm key={redactions} onSubmit={submit} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type={isUnsupportedVariant(state.code) ? "info" : "error"}
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <FeeBumpReplacementComparatorResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <FeeBumpReplacementComparatorEmptyState /> : null}
    </div>
  );
}
